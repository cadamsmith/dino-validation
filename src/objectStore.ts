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

  replace(data: Record<string, T>): void {
    Object.entries(data).forEach(([key, value]) => {
      if (key in this._store) {
        this._store[key] = value;
      }
    });
  }
}
