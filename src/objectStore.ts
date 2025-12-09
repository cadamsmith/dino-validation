export class ObjectStore<T> {
  private readonly _store: Record<string, T> = {};

  constructor(data: Record<string, T>) {
    this._store = data;
  }

  keys(): string[] {
    return Object.keys(this._store);
  }

  get(key: string): T | undefined {
    return this._store[key];
  }

  set(key: string, value: T): void {
    this._store[key] = value;
  }
}
