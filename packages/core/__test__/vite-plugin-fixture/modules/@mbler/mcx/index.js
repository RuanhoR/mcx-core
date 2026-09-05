// Minimal stub of the @mbler/mcx runtime so compiled .mcx output can be
// imported under Vitest without the real addon runtime installed.
export class Event {
  constructor(opt) {
    Object.assign(this, opt);
  }
  subscribe() {
    return true;
  }
}
export class ui {}
export class Form {}
