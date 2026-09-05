import type { MCXFile } from '@mbler/mcx-types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

class ModalFormDataMock {
  textField = vi.fn().mockReturnThis();
  slider = vi.fn().mockReturnThis();
  toggle = vi.fn().mockReturnThis();
  dropdown = vi.fn().mockReturnThis();
  submitButton = vi.fn().mockReturnThis();
  label = vi.fn().mockReturnThis();
  divider = vi.fn().mockReturnThis();
  title = vi.fn().mockReturnThis();
  show = vi.fn().mockResolvedValue({ canceled: true });
}
class ActionFormDataMock {
  button = vi.fn().mockReturnThis();
  label = vi.fn().mockReturnThis();
  divider = vi.fn().mockReturnThis();
  title = vi.fn().mockReturnThis();
  show = vi.fn().mockResolvedValue({ canceled: true });
}
class MessageFormDataMock {
  button1 = vi.fn().mockReturnThis();
  button2 = vi.fn().mockReturnThis();
  title = vi.fn().mockReturnThis();
  show = vi.fn().mockResolvedValue({ canceled: true });
}
class ObservableBase {
  static instances: ObservableBase[] = [];
  v: unknown;
  #fns: ((val: unknown) => void)[] = [];
  constructor(v: unknown) {
    this.v = v;
    ObservableBase.instances.push(this);
  }
  getData(): unknown {
    return this.v;
  }
  setData(v: unknown): void {
    this.v = v;
    for (const fn of this.#fns) fn(v);
  }
  subscribe(fn: (val: unknown) => void): void {
    this.#fns.push(fn);
  }
  unsubscribe(fn: (val: unknown) => void): void {
    this.#fns = this.#fns.filter(f => f !== fn);
  }
}
class ObservableString extends ObservableBase {}
class ObservableBoolean extends ObservableBase {}
class ObservableNumber extends ObservableBase {}

const mockEvent = vi.hoisted(() => ({
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('@minecraft/server', () => ({
  world: {
    afterEvents: {
      playerJoin: { ...mockEvent },
      playerLeave: { ...mockEvent },
      itemUse: { ...mockEvent },
    },
    beforeEvents: {
      chatSend: { ...mockEvent },
    },
  },
  system: { run: (fn: () => void) => fn() },
}));

vi.mock('@minecraft/server-ui', () => ({
  ModalFormData: ModalFormDataMock,
  ActionFormData: ActionFormDataMock,
  MessageFormData: MessageFormDataMock,
  ObservableString,
  ObservableBoolean,
  ObservableNumber,
}));

const { Event } = await import('../src/event');
const { generateAntiShake } = await import('../src/lib/Utils');
const { ref, unwrapValue, toDisplayString } = await import('../src/ref');
const { watch } = await import('../src/watch');

describe('Event option matrix', () => {
  beforeEach(() => {
    mockEvent.subscribe.mockClear();
    mockEvent.unsubscribe.mockClear();
  });
  it.each([
    { on: 'after', data: { playerJoin: vi.fn() } },
    { on: 'before', data: { chatSend: vi.fn() } },
    { on: 'after', data: { playerJoin: vi.fn(), playerLeave: vi.fn() } },
    { on: 'after', data: {} },
  ])('constructs with %j', opts => {
    const event = new Event(opts as never, () => {
      throw new Error('extend');
    });
    expect(event.status).toBeDefined();
  });
  it.each([1, 2, 5, 20, 100])('constructs with tick=%i anti-shake', tick => {
    const event = new Event(
      { on: 'after', tick, data: { playerJoin: vi.fn() } },
      () => {
        throw new Error('extend');
      },
    );
    expect(typeof event.status.all.playerJoin).toBe('function');
  });
  it.each([
    ['playerJoin', true],
    ['playerLeave', true],
    ['itemUse', true],
  ])('subscribe %s succeeds once', (name, expected) => {
    const event = new Event(
      { on: 'after', data: { playerJoin: vi.fn(), playerLeave: vi.fn(), itemUse: vi.fn() } },
      () => {
        throw new Error('extend');
      },
    );
    expect(event.subscribe(name)).toBe(expected);
    expect(event.subscribe(name)).toBe(false);
  });
  it.each(['playerJoin', 'playerLeave'])('unsubscribe %s after subscribe', name => {
    const event = new Event(
      { on: 'after', data: { playerJoin: vi.fn(), playerLeave: vi.fn() } },
      () => {
        throw new Error('extend');
      },
    );
    event.subscribe(name);
    expect(event.unsubscribe(name)).toBe(true);
  });
  it.each([
    ['after', 'playerJoin'],
    ['after', 'itemUse'],
    ['after', 'playerLeave'],
  ])('useWorld binds %s.%s to world', async (on, name) => {
    const { world: w } = await import('@minecraft/server');
    const event = new Event(
      { on, data: { [name]: vi.fn() } } as never,
      () => {
        throw new Error('extend');
      },
    );
    event.useWorld(w as never);
    expect((w.afterEvents as never as Record<string, typeof mockEvent>)[name]).toBeDefined();
  });
});

describe('generateAntiShake matrix', () => {
  // 语义：创建时的 lastRun 已记录，首次调用（间隔 0 <= tick）必被抑制；
  // 只有相邻两次调用的真实间隔 > tick 时才触发。
  it.each([
    { tick: 10, gaps: [5, 20], calls: 1 },
    { tick: 10, gaps: [5, 5], calls: 0 },
    { tick: 50, gaps: [10, 10], calls: 0 },
    { tick: 0, gaps: [0, 0], calls: 0 },
    { tick: 100, gaps: [99, 99], calls: 0 },
    { tick: 100, gaps: [101, 1], calls: 1 },
    { tick: 1, gaps: [2, 2, 2], calls: 3 },
  ])('tick=$tick gaps=$gaps yields $calls of ${gaps.length + 1} calls', ({ tick, gaps, calls }) => {
    vi.useFakeTimers();
    let now = 1_000;
    const spy = vi.spyOn(Date, 'now').mockImplementation(() => now);
    const fn = vi.fn();
    const shaken = generateAntiShake(fn, tick);
    shaken();
    for (const gap of gaps) {
      now += gap;
      shaken();
    }
    expect(fn).toHaveBeenCalledTimes(calls);
    spy.mockRestore();
    vi.useRealTimers();
  });
});

describe('ref matrix', () => {
  it.each([
    'hello',
    '',
    'multiple words',
  ])('ref string %j round-trips', value => {
    const r = ref(value);
    expect(r.value).toBe(value);
    r.value = `${value}!`;
    expect(r.value).toBe(`${value}!`);
  });
  it.each([0, 1, -5, 3.14])('ref number %j round-trips', value => {
    const r = ref(value);
    expect(r.value).toBe(value);
    r.value = value + 1;
    expect(r.value).toBe(value + 1);
  });
  it.each([true, false])('ref boolean %j round-trips', value => {
    const r = ref(value);
    expect(r.value).toBe(value);
    r.value = !value;
    expect(r.value).toBe(!value);
  });
  it.each([
    { init: 'a', set: 'b' },
    { init: 1, set: 2 },
    { init: true, set: false },
  ])('ref notifies watcher on change %j', ({ init, set }) => {
    const r = ref(init);
    const watcher = vi.fn();
    r.subscribe(watcher);
    r.value = set as never;
    expect(watcher).toHaveBeenCalledWith(set, init);
    r.unsubscribe(watcher);
  });
  it.each([
    { input: 'plain', expected: 'plain' },
    { input: 42, expected: '42' },
    { input: true, expected: 'true' },
    { input: null, expected: '' },
    { input: undefined, expected: '' },
  ])('toDisplayString($j) === $expected', ({ input, expected }) => {
    expect(toDisplayString(input)).toBe(expected);
  });
  it.each([
    { input: 'plain', expected: 'plain' },
    { input: 7, expected: 7 },
  ])('unwrapValue passes primitives through %j', ({ input, expected }) => {
    expect(unwrapValue(input)).toBe(expected);
  });
  it('unwrapValue unwraps refs', () => {
    expect(unwrapValue(ref('inner'))).toBe('inner');
    expect(unwrapValue(ref(3))).toBe(3);
  });
  it('watch returns unsubscribe and stops notifications', () => {
    const r = ref<string>('x');
    const cb = vi.fn();
    const stop = watch(r, cb);
    expect(typeof stop).toBe('function');
    r.value = 'y';
    expect(cb).toHaveBeenCalledWith('y', 'x');
    stop();
    r.value = 'z';
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
