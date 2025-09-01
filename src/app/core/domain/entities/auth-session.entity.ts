import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';

export class AuthSession {
  constructor(
    private readonly _userId: UserId,
    private readonly _email: Email,
    private readonly _token: string,
    private readonly _refreshToken: string,
    private readonly _expiresAt: Date,
    private readonly _createdAt: Date = new Date()
  ) {}

  get userId(): UserId {
    return this._userId;
  }

  get email(): Email {
    return this._email;
  }

  get token(): string {
    return this._token;
  }

  get refreshToken(): string {
    return this._refreshToken;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired() && this._token.length > 0;
  }

  toPlainObject() {
    return {
      userId: this._userId.value,
      email: this._email.value,
      token: this._token,
      refreshToken: this._refreshToken,
      expiresAt: this._expiresAt,
      createdAt: this._createdAt,
      isExpired: this.isExpired(),
      isValid: this.isValid()
    };
  }
}
