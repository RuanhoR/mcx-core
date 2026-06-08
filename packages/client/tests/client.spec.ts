import { describe, it, expect, vi, beforeEach } from 'vitest'

class ModalFormDataMock {
  textField = vi.fn().mockReturnThis()
  slider = vi.fn().mockReturnThis()
  toggle = vi.fn().mockReturnThis()
  dropdown = vi.fn().mockReturnThis()
  submitButton = vi.fn().mockReturnThis()
  label = vi.fn().mockReturnThis()
  divider = vi.fn().mockReturnThis()
  title = vi.fn().mockReturnThis()
  show = vi.fn().mockResolvedValue({ canceled: true })
}

class ActionFormDataMock {
  button = vi.fn().mockReturnThis()
  label = vi.fn().mockReturnThis()
  divider = vi.fn().mockReturnThis()
  title = vi.fn().mockReturnThis()
  show = vi.fn().mockResolvedValue({ canceled: true })
}

class MessageFormDataMock {
  button1 = vi.fn().mockReturnThis()
  button2 = vi.fn().mockReturnThis()
  title = vi.fn().mockReturnThis()
  show = vi.fn().mockResolvedValue({ canceled: true })
}

vi.mock('@minecraft/server', () => {
  const mockEvent = {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }
  return {
    world: {
      afterEvents: {
        PlayerJoin: mockEvent,
        PlayerLeave: mockEvent,
        EntityDie: mockEvent,
        ItemUse: mockEvent,
      },
      beforeEvents: {},
    },
  }
})

vi.mock('@minecraft/server-ui', () => ({
  ModalFormData: ModalFormDataMock,
  ActionFormData: ActionFormDataMock,
  MessageFormData: MessageFormDataMock,
}))

const { Event } = await import('../src/event')
const { createApp } = await import('../src/createApp')
const { ui } = await import('../src/ui')
const { generateAntiShake } = await import('../src/lib/Utils')
const serverUI = await import('@minecraft/server-ui')

describe('Event', () => {
  it('should create Event with basic options', () => {
    const event = new Event(
      { on: 'after', data: { PlayerJoin: 'handleJoin' } },
      () => { throw new Error('should not load extend') },
    )
    expect(event).toBeDefined()
    expect(event.status).toBeDefined()
    expect(event.status.all.PlayerJoin).toBe('handleJoin')
  })

  it('should create Event with tick (anti-shake)', () => {
    const event = new Event(
      { on: 'after', tick: 5, data: { PlayerJoin: 'handleJoin' } },
      () => { throw new Error('should not load extend') },
    )
    expect(typeof event.status.all.PlayerJoin).toBe('function')
  })

  it('should load extends', () => {
    const extendLoader = vi.fn(() => new Event(
      { on: 'after', data: {} },
      () => { throw new Error('nested extend') },
    ))
    new Event(
      { on: 'after', data: { PlayerJoin: 'fn' }, extends: [{} as any] },
      extendLoader,
    )
    expect(extendLoader).toHaveBeenCalledTimes(1)
  })

  it('should subscribe to events', () => {
    const handler = vi.fn()
    const event = new Event(
      { on: 'after', data: { PlayerJoin: handler as any } },
      () => { throw new Error('extend') },
    )
    const result = event.subscribe('PlayerJoin')
    expect(result).toBe(true)
  })

  it('should reject duplicate subscription', () => {
    const handler = vi.fn()
    const event = new Event(
      { on: 'after', data: { PlayerJoin: handler as any } },
      () => { throw new Error('extend') },
    )
    event.subscribe('PlayerJoin')
    const result = event.subscribe('PlayerJoin')
    expect(result).toBe(false)
  })

  it('should unsubscribe from events', () => {
    const handler = vi.fn()
    const event = new Event(
      { on: 'after', data: { PlayerJoin: handler as any } },
      () => { throw new Error('extend') },
    )
    event.subscribe('PlayerJoin')
    const result = event.unsubscribe('PlayerJoin')
    expect(result).toBe(true)
  })
})

describe('createApp', () => {
  it('should create App from valid MCX file', () => {
    const app = createApp({
      type: 'app',
      setup: () => ({}),
    } as any)
    expect(app).toBeDefined()
    expect(app.app.type).toBe('app')
  })

  it('should throw for non-app type', () => {
    expect(() =>
      createApp({ type: 'event', setup: () => ({}) } as any),
    ).toThrow()
  })
})

describe('Utils', () => {
  it('generateAntiShake should be a function', () => {
    expect(generateAntiShake).toBeDefined()
    expect(typeof generateAntiShake).toBe('function')
  })

  it('generateAntiShake should create a wrapped function', () => {
    const fn = vi.fn()
    const wrapped = generateAntiShake(fn, 100)
    expect(typeof wrapped).toBe('function')
  })
})

describe('ui', () => {
  it('should construct ui with basic config', () => {
    const instance = new ui(
      {
        use: serverUI.ModalFormData,
        UI: serverUI,
        layout: [{ type: 'title', content: 'Test Form', params: {} }],
      } as any,
      () => ({ prop: [] }),
    )
    expect(instance).toBeDefined()
  })

  it('should throw for invalid prop', () => {
    expect(() =>
      new ui(
        {
          use: serverUI.ModalFormData,
          UI: serverUI,
          layout: [],
        } as any,
        () => ({ prop: 'not-an-array' }),
      ),
    ).toThrow('invalid prop')
  })
})
