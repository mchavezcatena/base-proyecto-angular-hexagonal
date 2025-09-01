export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('El email no puede estar vacío');
    }

    const trimmedEmail = _value.trim().toLowerCase();

    if (!Email.EMAIL_REGEX.test(trimmedEmail)) {
      throw new Error('Formato de email inválido');
    }

    this._value = trimmedEmail;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  getDomain(): string {
    return this._value.split('@')[1];
  }

  getLocalPart(): string {
    return this._value.split('@')[0];
  }
}
