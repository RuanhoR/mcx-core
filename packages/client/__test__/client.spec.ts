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

const startupSubscribeMock = vi.hoisted(() => vi.fn());
const registerCommandMock = vi.hoisted(() => vi.fn());
const registerEnumMock = vi.hoisted(() => vi.fn());

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
  system: {
    beforeEvents: {
      startup: {
        subscribe: startupSubscribeMock,
        unsubscribe: vi.fn(),
      },
    },
  },
  CustomCommandParamType: {
    Boolean: 'Boolean',
    Float: 'Float',
    Integer: 'Integer',
    String: 'String',
    PlayerSelector: 'PlayerSelector',
    EntitySelector: 'EntitySelector',
    EntityType: 'EntityType',
    BlockType: 'BlockType',
    ItemType: 'ItemType',
    Location: 'Location',
    Enum: 'Enum',
  },
  CommandPermissionLevel: {
    Any: 0,
    GameDirectors: 1,
    Admin: 2,
    Host: 3,
    Owner: 4,
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
const { Command, registryCommand } = await import('../src/command');
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
        data: { playerJoin: () => { } },
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
      layout: [{ type: 'title', content: () => 'Test Form', params: {} }],
      ...overrides,
    }) as unknown as MCXUIOpt;

  it('should construct ui with basic config', () => {
    const instance = new ui(createUIConfig(), () => ({ prop: [] }));
    expect(instance).toBeDefined();
  });

  it('should construct ui with modal form layout', () => {
    const instance = new ui(
      {
        use: serverUI.ModalFormData,
        UI: serverUI,
        layout: [
          { type: 'title', content: () => 'Form', params: {} },
          {
            type: 'input',
            content: () => 'Name',
            params: { placeholderText: () => 'Enter name' },
          },
          { type: 'slider', content: () => 'Count', params: { min: () => '0', max: () => '10' } },
          { type: 'toggle', content: () => 'Enable', params: { default: () => 'true' } },
          {
            type: 'dropdown',
            content: () => 'Color',
            params: { option: () => 'red,green,blue' },
          },
          { type: 'body', content: () => 'Body text', params: {} },
          { type: 'divider', content: () => '', params: {} },
          { type: 'submit', content: () => 'Go', params: { click: () => () => { } } },
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
          { type: 'title', content: () => 'Menu', params: {} },
          { type: 'button', content: () => 'Option 1', params: { click: () => () => { } } },
          { type: 'body', content: () => 'Select option', params: {} },
          { type: 'divider', content: () => '', params: {} },
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
          { type: 'title', content: () => 'Confirm', params: {} },
          { type: 'button-m', content: () => 'Yes', params: { click: () => () => { } } },
          { type: 'button-m', content: () => 'No', params: { click: () => () => { } } },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: [] }),
    );
    expect(instance).toBeDefined();
  });

  it('should throw for invalid UI type', async () => {
    class FakeUI { }
    const instance = new ui(
      {
        use: FakeUI as unknown as typeof serverUI.ModalFormData,
        UI: serverUI,
        layout: [
          {
            type: 'title',
            content: () => 'X',
            params: {},
          },
        ],
      },
      () => ({ prop: [] }),
    );
    await expect(instance.show({} as Player, {})).rejects.toThrow('Invalid form type');
  });

  it('should accept string click for button as srcResult key', () => {
    const clickFn = vi.fn();
    const instance = new ui(
      {
        use: serverUI.ActionFormData,
        UI: serverUI,
        layout: [
          { type: 'button', content: () => 'Click', params: { click: () => clickFn } },
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
          { type: 'title', content: () => 'Form', params: {} },
          { type: 'input', content: () => 'Name', params: {} },
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
          { type: 'button', content: () => 'Go', params: { click: () => clickHandler } },
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
          { type: 'button-m', content: () => 'Yes', params: { click: () => clickHandler } },
        ],
      } as unknown as MCXUIOpt,
      () => ({ prop: [] }),
    );
    await instance.show({} as Player, {});
    expect(mockShow).toHaveBeenCalled();
  });

});

describe('Command', () => {
  it('should construct with a name', () => {
    const cmd = new Command('my:test');
    expect(cmd.getName()).toBe('my:test');
  });

  it('should add mandatory parameters with string type', () => {
    const cmd = new Command('my:cmd');
    cmd.addMandatoryParameter('target', 'player');
    const customCmd = cmd.toCustomCommand();
    expect(customCmd.mandatoryParameters).toHaveLength(1);
    expect(customCmd.mandatoryParameters![0]!.name).toBe('target');
    expect(customCmd.mandatoryParameters![0]!.type).toBe('PlayerSelector');
  });

  it('should add optional parameters with object type', () => {
    const cmd = new Command('my:cmd');
    cmd.addOptionalParameter('count', { type: 'number', min: 0, max: 99 });
    const customCmd = cmd.toCustomCommand();
    expect(customCmd.optionalParameters).toHaveLength(1);
    expect(customCmd.optionalParameters![0]!.name).toBe('count');
    expect(customCmd.optionalParameters![0]!.type).toBe('Float');
  });

  it('should support builder pattern', () => {
    const cmd = new Command('my:cmd')
      .addMandatoryParameter('target', 'player')
      .addOptionalParameter('count', 'integer')
      .setDescription('Test command')
      .setCheatsRequired(false);
    const customCmd = cmd.toCustomCommand();
    expect(customCmd.description).toBe('Test command');
    expect(customCmd.cheatsRequired).toBe(false);
  });

  it('should resolve all param types correctly', () => {
    const cmd = new Command('my:cmd')
      .addMandatoryParameter('a', 'boolean')
      .addMandatoryParameter('b', 'float')
      .addMandatoryParameter('c', 'string')
      .addMandatoryParameter('d', 'player')
      .addMandatoryParameter('e', 'entity')
      .addMandatoryParameter('f', 'entityType')
      .addMandatoryParameter('g', 'blockType')
      .addMandatoryParameter('h', 'itemType')
      .addMandatoryParameter('i', 'location')
      .addMandatoryParameter('j', 'enum')
      .addOptionalParameter('k', 'integer');
    const customCmd = cmd.toCustomCommand();
    expect(customCmd.mandatoryParameters![0]!.type).toBe('Boolean');
    expect(customCmd.mandatoryParameters![1]!.type).toBe('Float');
    expect(customCmd.mandatoryParameters![2]!.type).toBe('String');
    expect(customCmd.mandatoryParameters![3]!.type).toBe('PlayerSelector');
    expect(customCmd.mandatoryParameters![4]!.type).toBe('EntitySelector');
    expect(customCmd.mandatoryParameters![5]!.type).toBe('EntityType');
    expect(customCmd.mandatoryParameters![6]!.type).toBe('BlockType');
    expect(customCmd.mandatoryParameters![7]!.type).toBe('ItemType');
    expect(customCmd.mandatoryParameters![8]!.type).toBe('Location');
    expect(customCmd.mandatoryParameters![9]!.type).toBe('Enum');
    expect(customCmd.optionalParameters![0]!.type).toBe('Integer');
  });

  it('should set permission level', () => {
    const cmd = new Command('my:cmd')
      .setPermissionLevel(2);
    expect(cmd.toCustomCommand().permissionLevel).toBe(2);
  });

  it('should default cheatsRequired to true', () => {
    const cmd = new Command('my:cmd');
    expect(cmd.toCustomCommand().cheatsRequired).toBe(true);
  });

  it('should not include empty parameter arrays', () => {
    const cmd = new Command('my:cmd');
    const result = cmd.toCustomCommand();
    expect(result.mandatoryParameters).toBeUndefined();
    expect(result.optionalParameters).toBeUndefined();
  });
});

describe('registryCommand', () => {
  beforeEach(() => {
    registerCommandMock.mockClear();
    registerEnumMock.mockClear();
  });

  it('should subscribe to startup on first registryCommand call', () => {
    const cmd = new Command('my:cmd01');
    registryCommand(cmd);
    expect(startupSubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('should not subscribe again on second registryCommand call', () => {
    const cmd = new Command('my:cmd02');
    registryCommand(cmd);
    expect(startupSubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('.action() should call registryCommand and not duplicate subscription', () => {
    const cmd = new Command('my:actcmd');
    cmd.action(() => ({ status: 0 }));
    expect(startupSubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('should register all queued commands at startup', () => {
    const startupCb = startupSubscribeMock.mock.calls[0]![0];
    const mockRegistry = {
      registerCommand: registerCommandMock,
      registerEnum: registerEnumMock,
    };
    startupCb({ customCommandRegistry: mockRegistry });
    expect(registerCommandMock).toHaveBeenCalledTimes(3);
    expect(registerCommandMock.mock.calls[0]![0]!.name).toBe('my:cmd01');
    expect(registerCommandMock.mock.calls[1]![0]!.name).toBe('my:cmd02');
    expect(registerCommandMock.mock.calls[2]![0]!.name).toBe('my:actcmd');
  });

  it('should error when registering via registryCommand after startup', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const cmd = new Command('my:cmd03');
    registryCommand(cmd);
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0]![0]).toContain('Cannot register command');
    consoleSpy.mockRestore();
  });

  it('.action() should error when called after startup', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const cmd = new Command('my:actafter');
    cmd.action(() => ({ status: 0 }));
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0]![0]).toContain('Cannot register command');
    consoleSpy.mockRestore();
  });
});
