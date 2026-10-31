import { API_BASE_URL } from '../config/env';

// Free hosting can take about a minute to wake up, so allow plenty of time.
export const REQUEST_TIMEOUT_MS = 75_000;

/**
 * Error with a `kind` the form can translate:
 * 'validation' | 'rate_limited' | 'network' | 'timeout' | 'server'
 */
export class EnquiryError extends Error {
  constructor(kind, fields = {}) {
    super(kind);
    this.name = 'EnquiryError';
    this.kind = kind;
    this.fields = fields; // { fieldName: ['required', 'max_length', ...] }
  }
}

/** Send an enquiry to the Django API. Resolves on success, throws EnquiryError otherwise. */
export async function submitEnquiry(data, { timeoutMs = REQUEST_TIMEOUT_MS, fetchImpl = fetch } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetchImpl(`${API_BASE_URL}/enquiries/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
      credentials: 'omit',
    });
  } catch (error) {
    throw new EnquiryError(error?.name === 'AbortError' ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 201) return { ok: true };

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON error page (for example from a proxy): treat as a server error.
  }

  if (response.status === 429) throw new EnquiryError('rate_limited');
  if (response.status === 400 && body?.error === 'validation_error') {
    const fields = Object.fromEntries(
      Object.entries(body.fields ?? {}).map(([name, errors]) => [
        name,
        (Array.isArray(errors) ? errors : []).map((e) => e?.code ?? 'invalid'),
      ]),
    );
    throw new EnquiryError('validation', fields);
  }
  throw new EnquiryError('server');
}
