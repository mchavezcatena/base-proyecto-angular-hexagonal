export class UserId {
  constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('UserId no puede estar vacío');
    }
    this._value = _value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(): UserId {
    return new UserId(crypto.randomUUID());
  }
}
