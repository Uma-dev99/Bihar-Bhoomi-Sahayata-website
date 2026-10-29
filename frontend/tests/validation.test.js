import { describe, expect, it } from 'vitest';
import { isValidPhone, mapServerErrors, validateEnquiry } from '../src/utils/validation';

const valid = {
  name: 'Ram Kumar',
  phone: '9812345678',
  preferred_language: 'hi',
  service_type: 'mutation',
  district: '',
  message: 'Need help with mutation papers.',
  privacy_accepted: true,
};

describe('client validation (mirrors the Django serializer)', () => {
  it.each([
    ['9812345678', true],
    ['09812345678', true],
    ['+91 98123 45678', true],
    ['91-98123-45678', true],
    ['+44 7700 900123', true],
    ['12345', false],
    ['5123456789', false],
    ['', false],
  ])('phone %s -> %s', (phone, ok) => expect(isValidPhone(phone)).toBe(ok));

  it('accepts a valid enquiry', () => expect(validateEnquiry(valid)).toEqual({}));

  it('applies length limits', () => {
    expect(validateEnquiry({ ...valid, name: 'a'.repeat(101) }).name).toBe('nameLong');
    expect(validateEnquiry({ ...valid, name: 'a'.repeat(100) }).name).toBeUndefined();
    expect(validateEnquiry({ ...valid, message: 'x'.repeat(2001) }).message).toBe('messageLong');
    expect(validateEnquiry({ ...valid, message: 'x'.repeat(2000) }).message).toBeUndefined();
  });

  it('rejects invalid choices', () => {
    expect(validateEnquiry({ ...valid, preferred_language: 'fr' }).preferred_language).toBe(
      'invalidChoice',
    );
    expect(validateEnquiry({ ...valid, service_type: 'legal' }).service_type).toBe('invalidChoice');
    expect(validateEnquiry({ ...valid, district: 'atlantis' }).district).toBe('invalidChoice');
  });

  it('accepts Hindi names', () => {
    expect(validateEnquiry({ ...valid, name: 'राम कुमार' })).toEqual({});
  });

  it('maps server codes to translation keys', () => {
    expect(
      mapServerErrors({
        name: ['blank'],
        message: ['max_length'],
        service_type: ['invalid_choice'],
        privacy_accepted: ['required'],
      }),
    ).toEqual({
      name: 'required',
      message: 'messageLong',
      service_type: 'invalidChoice',
      privacy_accepted: 'privacy',
    });
  });
});
