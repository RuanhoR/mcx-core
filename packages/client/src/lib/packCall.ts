import { World, world } from '@minecraft/server';
type WorldProtoype = (typeof World)['prototype'];
interface MockdWorld extends WorldProtoype {
  _mcx_packcall: {
    subscribePack(): void;
    listPack(): number[];
    createEvent(
      eventName: string,
      handler: (packId: number, data: unknown) => unknown | Promise<unknown>,
    ): void;
    push(
      eventName: string,
      data: unknown,
      packId: number,
    ): Promise<unknown> | unknown;
    on(
      eventName: string,
      handler: (packId: number, data: unknown) => unknown | Promise<unknown>,
    ): void;
  };
}
let initd = false;
export function init() {
  initd = true;
  const MockdWorld = World.prototype as MockdWorld;
  if (MockdWorld._mcx_packcall) {
    MockdWorld._mcx_packcall.subscribePack();
  } else {
    const packArr: number[] = [];
    let currentMaxPackId = 0;
    const eventMap = new Map<
      string,
      Parameters<MockdWorld['_mcx_packcall']['createEvent']>[1]
    >();
    MockdWorld._mcx_packcall = {
      subscribePack() {
        packArr.push(currentMaxPackId++);
      },
      listPack() {
        return packArr;
      },
      createEvent(eventName, handler) {
        if (eventMap.has(eventName)) {
          throw new TypeError(
            `[mcx PackCall]: Can't createEvent: event(${eventName}) is used`,
          );
        }
        eventMap.set(eventName, handler);
      },
      push(eventName, data, packId) {
        const subscribed = eventMap.get(eventName);
        if (!subscribed) {
          throw new TypeError(`[mcx PackCall]: Not find event ${eventName}`);
        }
        if (!packArr.includes(packId)) {
          throw new TypeError('[mcx internal]: invaild packId');
        }
        return subscribed(packId, data);
      },
      on(eventName, handler) {
        const old = eventMap.get(eventName);
        if (!eventMap.has(eventName) || !old) {
          throw new TypeError(
            `[mcx PackCall]: Can't exec on: event (${eventName}) is not subscribe`,
          );
        }
        eventMap.set(eventName, (...args) => {
          (handler(...args), old(...args));
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
