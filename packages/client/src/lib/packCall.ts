import { World, world } from '@minecraft/server';
type WorldProtoype = (typeof World)['prototype'];
interface MockdWorld extends WorldProtoype {
  _mcx_packcall: {
    createEvent(
      eventName: string,
      handler: (data: unknown) => unknown | Promise<unknown>,
    ): void;
    push(
      eventName: string,
      data: unknown,
      packId: number,
    ): Promise<unknown> | unknown;
    on(
      eventName: string,
      handler: Parameters<MockdWorld['_mcx_packcall']['createEvent']>[1],
    ): void;
    eventMap: Map<
      string,
      Parameters<MockdWorld['_mcx_packcall']['createEvent']>[1]
    >;
  };
}
let initd = false;
export function init() {
  initd = true;
  const MockdWorld = World.prototype as MockdWorld;
  if (!MockdWorld._mcx_packcall) {
    MockdWorld._mcx_packcall = {
      eventMap: new Map(),

      createEvent(eventName, handler) {
        if (this.eventMap.has(eventName)) {
          throw new TypeError(
            `[mcx PackCall]: Can't createEvent: event(${eventName}) is used`,
          );
        }
        this.eventMap.set(eventName, handler);
      },
      push(eventName, data) {
        const subscribed = this.eventMap.get(eventName);
        if (!subscribed) {
          throw new TypeError(`[mcx PackCall]: Not find event ${eventName}`);
        }
        return subscribed(data);
      },
      on(eventName, handler) {
        const old = this.eventMap.get(eventName);
        if (!this.eventMap.has(eventName) || !old) {
          throw new TypeError(
            `[mcx PackCall]: Can't exec on: event (${eventName}) is not subscribe`,
          );
        }
        this.eventMap.set(eventName, data => {
          (handler(data), old(data));
        });
      },
    };
  }
}
export function createEvent(
  ...args: Parameters<MockdWorld['_mcx_packcall']['createEvent']>
) {
  if (!initd) init();
  (world as MockdWorld)._mcx_packcall.createEvent(...args);
}
export function runEvent(
  ...args: Parameters<MockdWorld['_mcx_packcall']['push']>
) {
  if (!initd) init();
  (world as MockdWorld)._mcx_packcall.push(...args);
}
export function onEventRun(
  ...args: Parameters<MockdWorld['_mcx_packcall']['on']>
) {
  if (!initd) init();
  (world as MockdWorld)._mcx_packcall.on(...args);
}
