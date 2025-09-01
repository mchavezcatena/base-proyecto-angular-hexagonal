import { Email } from './email.vo';

describe('Email Value Object', () => {
  it('should create email with valid address', () => {
    const email = new Email('test@example.com');
    expect(email.value).toBe('test@example.com');
  });

  it('should normalize email to lowercase', () => {
    const email = new Email('TEST@EXAMPLE.COM');
    expect(email.value).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    const email = new Email('  test@example.com  ');
    expect(email.value).toBe('test@example.com');
  });

  it('should throw error for invalid email format', () => {
    expect(() => new Email('invalid-email')).toThrow('Email inválido');
    expect(() => new Email('test@')).toThrow('Email inválido');
    expect(() => new Email('@example.com')).toThrow('Email inválido');
    expect(() => new Email('')).toThrow('Email inválido');
  });

  it('should handle equals method correctly', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('TEST@EXAMPLE.COM');
    const email3 = new Email('different@example.com');

    expect(email1.equals(email2)).toBeTruthy();
    expect(email1.equals(email3)).toBeFalsy();
  });

  it('should validate domain correctly', () => {
    expect(() => new Email('test@.com')).toThrow('Email inválido');
    expect(() => new Email('test@domain.')).toThrow('Email inválido');
    expect(() => new Email('test@domain')).toThrow('Email inválido');
  });

  it('should handle special characters in email', () => {
    const validEmails = [
      'test.email@example.com',
      'test+tag@example.com',
      'test_email@example.com',
      'test-email@example.com'
    ];

    validEmails.forEach(emailString => {
      expect(() => new Email(emailString)).not.toThrow();
    });
  });

  it('should return string representation', () => {
    const email = new Email('test@example.com');
    expect(email.toString()).toBe('test@example.com');
  });
});
