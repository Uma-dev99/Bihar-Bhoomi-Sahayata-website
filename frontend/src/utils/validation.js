/**
 * Client-side checks that mirror backend/enquiries/serializers.py.
 * They give instant feedback; the server still validates everything.
 */
import { LANGUAGES } from '../config/languages';
import { serviceTypeOptions } from '../content/services';
import { districts } from '../content/districts';

export const LIMITS = { nameMin: 2, nameMax: 100, messageMin: 10, messageMax: 2000 };

const collapse = (value) => (value ?? '').split(/\s+/).filter(Boolean).join(' ');

export function isValidPhone(raw) {
  let value = (raw ?? '').replace(/[\s\-().]/g, '');
  if (value.startsWith('00')) value = `+${value.slice(2)}`;
  let local;
  if (value.startsWith('+91')) local = value.slice(3);
  else if (value.startsWith('91') && value.length === 12) local = value.slice(2);
  else if (value.startsWith('0') && value.length === 11) local = value.slice(1);
  else if (value.startsWith('+')) return /^\+[1-9]\d{7,14}$/.test(value);
  else local = value;
  return /^[6-9]\d{9}$/.test(local);
}

const DISTRICT_VALUES = ['', 'not_sure', ...districts.map((d) => d.id)];

/** Returns { field: translationKey } for every problem found. */
export function validateEnquiry(values) {
  const errors = {};
  const name = collapse(values.name);
  if (!name) errors.name = 'required';
  else if (name.length < LIMITS.nameMin) errors.name = 'nameShort';
  else if (name.length > LIMITS.nameMax) errors.name = 'nameLong';
  else if (!/\p{L}/u.test(name)) errors.name = 'nameInvalid';

  if (!(values.phone ?? '').trim()) errors.phone = 'required';
  else if (!isValidPhone(values.phone)) errors.phone = 'phoneInvalid';

  if (!LANGUAGES.includes(values.preferred_language)) errors.preferred_language = 'invalidChoice';
  if (!values.service_type) errors.service_type = 'required';
  else if (!serviceTypeOptions.includes(values.service_type)) errors.service_type = 'invalidChoice';
  if (!DISTRICT_VALUES.includes(values.district ?? '')) errors.district = 'invalidChoice';

  const message = (values.message ?? '').trim();
  if (!message) errors.message = 'required';
  else if (message.length < LIMITS.messageMin) errors.message = 'messageShort';
  else if (message.length > LIMITS.messageMax) errors.message = 'messageLong';

  if (values.privacy_accepted !== true) errors.privacy_accepted = 'privacy';
  return errors;
}

/** Translate the server's error codes into the same translation keys. */
const SERVER_CODE_MAP = {
  name: { min_length: 'nameShort', max_length: 'nameLong', invalid: 'nameInvalid' },
  phone: { invalid: 'phoneInvalid' },
  message: { min_length: 'messageShort', max_length: 'messageLong' },
};

export function mapServerErrors(fields) {
  const errors = {};
  for (const [field, codes] of Object.entries(fields ?? {})) {
    const code = codes[0];
    if (field === 'privacy_accepted') errors[field] = 'privacy';
    else if (code === 'required' || code === 'blank' || code === 'null') errors[field] = 'required';
    else if (code === 'invalid_choice') errors[field] = 'invalidChoice';
    else errors[field] = SERVER_CODE_MAP[field]?.[code] ?? 'server';
  }
  return errors;
}
