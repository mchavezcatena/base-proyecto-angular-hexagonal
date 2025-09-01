export class RoleId {
  constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('RoleId no puede estar vacío');
    }
    this._value = _value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: RoleId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(): RoleId {
    return new RoleId(crypto.randomUUID());
  }
}
