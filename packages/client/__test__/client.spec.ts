import type { MCXFile, MCXUIOpt } from '@mbler/mcx-types';
import type { Player } from '@minecraft/server';
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

const mockEvent = vi.hoisted(() => ({
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('@minecraft/server', () => ({
  world: {
    afterEvents: {
      playerJoin: { ...mockEvent },
      PlayerLeave: { ...mockEvent },
      EntityDie: { ...mockEvent },
      ItemUse: { ...mockEvent },
    },
    beforeEvents: {},
  },
}));

vi.mock('@minecraft/server-ui', () => ({
  ModalFormData: ModalFormDataMock,
  ActionFormData: ActionFormDataMock,
  MessageFormData: MessageFormDataMock,
}));

const { Event } = await import('../src/event');
const { createApp } = await import('../src/createApp');
const { ui } = await import('../src/ui');
const { generateAntiShake } = await import('../src/lib/Utils');
const { App } = await import('../src/lib/App');
const serverUI = await import('@minecraft/server-ui');

describe('Event', () => {
  it('should create Event with basic options', () => {
    const event = new Event(
      { on: 'after', data: { playerJoin: vi.fn() } },
      () => {
        throw new Error('should not load extend');
      },
    );
    expect(event).toBeDefined();
    expect(event.status).toBeDefined();
    expect(event.status.all.playerJoin).toBeDefined();
  });

  it('should create Event with tick (anti-shake)', () => {
    const event = new Event(
      { on: 'after', tick: 5, data: { playerJoin: vi.fn() } },
      () => {
        throw new Error('should not load extend');
      },
    );
    expect(typeof event.status.all.playerJoin).toBe('function');
  });

  it('should load extends', () => {
    const extendLoader = vi.fn(
      () =>
        new Event({ on: 'after', data: {} }, () => {
          throw new Error('nested extend');
        }),
    );
    new Event(
      {
        on: 'after',
        data: { playerJoin: () => {} },
        extends: [{} as unknown as MCXFile<'event'>],
      },
      extendLoader,
    );
    expect(extendLoader).toHaveBeenCalledTimes(1);
  });

  it('should subscribe to events', () => {
    const handler = vi.fn();
    const event = new Event(
      { on: 'after', data: { playerJoin: handler } },
      () => {
        throw new Error('extend');
      },
    );
    const result = event.subscribe('playerJoin');
    expect(result).toBe(true);
  });

  it('should reject duplicate subscription', () => {
    const handler = vi.fn();
    const event = new Event(
      { on: 'after', data: { playerJoin: handler } },
      () => {
        throw new Error('extend');
      },
    );
    event.subscribe('playerJoin');
    const result = event.subscribe('playerJoin');
    expect(result).toBe(false);
  });

  it('should unsubscribe from events', () => {
    const handler = vi.fn();
    const event = new Event(
      { on: 'after', data: { playerJoin: handler } },
      () => {
        throw new Error('extend');
      },
    );
    event.subscribe('playerJoin');
    const result = event.unsubscribe('playerJoin');
    expect(result).toBe(true);
  });

  it('should use world to bind events', async () => {
    const handler = vi.fn();
    const event = new Event(
      { on: 'after', data: { playerJoin: handler } },
      () => {
        throw new Error('extend');
      },
    );
    const { world: w } = await import('@minecraft/server');
    event.useWorld(w);
    expect(w.afterEvents.playerJoin.subscribe).toHaveBeenCalled();
  });
});

describe('createApp', () => {
  it('should create App from valid MCX file', () => {
    const app = createApp({
      type: 'app',
      setup: () => ({}),
    } as unknown as Parameters<typeof createApp>[0]);
    expect(app).toBeDefined();
    expect(app.app.type).toBe('app');
  });

  it('should throw for non-app type', () => {
    expect(() =>
      createApp({
        type: 'event',
        setup: () => ({}),
      } as unknown as MCXFile<'app'>),
    ).toThrow();
  });
});

describe('App', () => {
  it('should mount with events', async () => {
    const handler = vi.fn();
    const eventMcx = {
      type: 'event',
      setup: () => ({ test: handler }),
      app: { event: { data: { playerJoin: 'test' }, on: 'after' as const } },
    } as unknown as MCXFile<'event'>;
    const app = new App({
      type: 'app',
      setup: () => ({ test: handler }),
      app: { event: [eventMcx] },
    } as unknown as MCXFile<'app'>);
    const { world: w } = await import('@minecraft/server');
    app.mount(w);
    expect(w.afterEvents.playerJoin.subscribe).toHaveBeenCalled();
  });

  it('should throw for non-app type in constructor', () => {
    expect(
      () => new App({ type: 'event' } as unknown as MCXFile<'app'>),
    ).toThrow();
  });

  it('should throw when event handler is not a function', async () => {
    const eventMcx = {
      type: 'event',
      setup: () => ({ test: 'not-a-function' }),
      app: { event: { data: { playerJoin: 'test' }, on: 'after' as const } },
    } as unknown as MCXFile<'event'>;
    const app = new App({
      type: 'app',
      setup: () => ({ test: 'not-a-function' }),
      app: { event: [eventMcx] },
    } as unknown as MCXFile<'app'>);
    const { world: w } = await import('@minecraft/server');
    expect(() => app.mount(w)).toThrow();
  });

  it('should handle mount without events', async () => {
    const app = new App({
      type: 'app',
      setup: () => ({}),
      app: {},
    } as unknown as MCXFile<'app'>);
    const { world: w } = await import('@minecraft/server');
    expect(() => app.mount(w)).not.toThrow();
  });
});

describe('Utils', () => {
  it('generateAntiShake should be a function', () => {
    expect(generateAntiShake).toBeDefined();
    expect(typeof generateAntiShake).toBe('function');
  });

  it('generateAntiShake should create a wrapped function', () => {
    const fn = vi.fn();
    const wrapped = generateAntiShake(fn, 100);
    expect(typeof wrapped).toBe('function');
  });

  it('generateAntiShake should throttle calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = generateAntiShake(fn, 100);
    vi.advanceTimersByTime(101);
    wrapped();
    expect(fn).toHaveBeenCalledTimes(1);
    wrapped();
    wrapped();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(101);
    wrapped();
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('ui', () => {
  const createUIConfig = (overrides: Partial<MCXUIOpt> = {}): MCXUIOpt =>
    ({
      use: serverUI.ModalFormData,
      UI: serverUI,
      layout: [{ type: 'title', content: 'Test Form', params: {} }],
      ...overrides,
    }) as unknown as MCXUIOpt;

  it('should construct ui with basic config', () => {
    const instance = new ui(createUIConfig(), () => ({ prop: [] }));
    expect(instance).toBeDefined();
  });

  it('should throw for invalid prop', () => {
    expect(
      () => new ui(createUIConfig(), () => ({ prop: 'not-an-array' })),
    ).toThrow('invalid prop');
  });

  it('should construct ui with modal form layout', () => {
    const instance = new ui(
      {
        use: serverUI.ModalFormData,
        UI: serverUI,
        layout: [
          { type: 'title', content: 'Form', params: {} },
          {
            type: 'input',
            content: 'Name',
            params: { placeholderText: 'Enter name' },
          },
          { type: 'slider', content: 'Count', params: { min: '0', max: '10' } },
          { type: 'toggle', content: 'Enable', params: { default: 'true' } },
          {
            type: 'dropdown',
            content: 'Color',
            params: { option: 'red,green,blue' },
          },
          { type: 'body', content: 'Body text', params: {} },
          { type: 'divider', content: '', params: {} },
          { type: 'submit', content: 'Go', params: { click: () => {} } },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: [] }),
    );
    expect(instance).toBeDefined();
  });

  it('should construct ui with action form layout', () => {
    const instance = new ui(
      {
        use: serverUI.ActionFormData,
        UI: serverUI,
        layout: [
          { type: 'title', content: 'Menu', params: {} },
          { type: 'button', content: 'Option 1', params: { click: () => {} } },
          { type: 'body', content: 'Select option', params: {} },
          { type: 'divider', content: '', params: {} },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: [] }),
    );
    expect(instance).toBeDefined();
  });

  it('should construct ui with message form layout', () => {
    const instance = new ui(
      {
        use: serverUI.MessageFormData,
        UI: serverUI,
        layout: [
          { type: 'title', content: 'Confirm', params: {} },
          { type: 'button-m', content: 'Yes', params: { click: () => {} } },
          { type: 'button-m', content: 'No', params: { click: () => {} } },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: [] }),
    );
    expect(instance).toBeDefined();
  });

  it('should throw for invalid UI type', () => {
    class FakeUI {}
    expect(
      () =>
        new ui(
          {
            use: FakeUI as unknown as typeof serverUI.ModalFormData,
            UI: serverUI,
            layout: [
              {
                type: 'title',
                content: 'X',
                params: {} as unknown as {
                  [key in
                    | 'click'
                    | 'default'
                    | 'option'
                    | 'min'
                    | 'max'
                    | 'placeholderText'
                    | 'tip'
                    | 'img']: string | { useProp: string };
                },
              },
            ],
          },
          () => ({ prop: [] }),
        ),
    ).toThrow('Invalid UI type');
  });

  it('should accept string click for button as srcResult key', () => {
    const clickFn = vi.fn();
    const instance = new ui(
      {
        use: serverUI.ActionFormData,
        UI: serverUI,
        layout: [
          { type: 'button', content: 'Click', params: { click: 'handler' } },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: [], handler: clickFn }),
    );
    expect(instance).toBeDefined();
  });

  it('should show modal form', async () => {
    const mockShow = vi.fn().mockResolvedValue({ canceled: true });
    class ModalMock extends ModalFormDataMock {
      show = mockShow;
    }
    const instance = new ui(
      {
        use: ModalMock as unknown as typeof serverUI.ModalFormData,
        UI: {
          ModalFormData: ModalMock,
          ActionFormData: ActionFormDataMock,
          MessageFormData: MessageFormDataMock,
        } as unknown as typeof serverUI,
        layout: [
          { type: 'title', content: 'Form', params: {} },
          { type: 'input', content: 'Name', params: {} },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: [] }),
    );
    await instance.show({} as Player, {});
    expect(mockShow).toHaveBeenCalled();
  });

  it('should show action form with button click', async () => {
    const clickHandler = vi.fn();
    const mockShow = vi
      .fn()
      .mockResolvedValue({ canceled: false, selection: 0 });
    class ActionMock extends ActionFormDataMock {
      show = mockShow;
    }
    const instance = new ui(
      {
        use: ActionMock as unknown as typeof serverUI.ModalFormData,
        UI: {
          ModalFormData: ModalFormDataMock,
          ActionFormData: ActionMock,
          MessageFormData: MessageFormDataMock,
        } as unknown as typeof serverUI,
        layout: [
          { type: 'button', content: 'Go', params: { click: clickHandler } },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: [] }),
    );
    await instance.show({} as Player, {});
    expect(mockShow).toHaveBeenCalled();
    expect(clickHandler).toHaveBeenCalled();
  });

  it('should show message form with button click', async () => {
    const clickHandler = vi.fn();
    const mockShow = vi
      .fn()
      .mockResolvedValue({ canceled: false, selection: 0 });
    class MessageMock extends MessageFormDataMock {
      show = mockShow;
    }
    const instance = new ui(
      {
        use: MessageMock as unknown as typeof serverUI.ModalFormData,
        UI: {
          ModalFormData: ModalFormDataMock,
          ActionFormData: ActionFormDataMock,
          MessageFormData: MessageMock,
        } as unknown as typeof serverUI,
        layout: [
          { type: 'button-m', content: 'Yes', params: { click: clickHandler } },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: [] }),
    );
    await instance.show({} as Player, {});
    expect(mockShow).toHaveBeenCalled();
  });

  it('should throw for props not found in show', async () => {
    const instance = new ui(
      {
        use: serverUI.ModalFormData,
        UI: serverUI,
        layout: [
          { type: 'title', content: { useProp: 'missing' }, params: {} },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: ['missing'] }),
    );
    await expect(instance.show({} as Player, {})).rejects.toThrow(
      'prop "missing" not found',
    );
  });

  it('should throw for useProp params not found in show', async () => {
    const instance = new ui(
      {
        use: serverUI.ModalFormData,
        UI: serverUI,
        layout: [
          {
            type: 'input',
            content: 'Name',
            params: { default: { useProp: 'missing' } },
          },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: ['missing'] }),
    );
    await expect(instance.show({} as Player, {})).rejects.toThrow(
      'prop "missing" not found',
    );
  });
});
