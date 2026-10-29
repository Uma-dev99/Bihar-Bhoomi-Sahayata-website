import { describe, expect, it, vi } from 'vitest';
import { EnquiryError, submitEnquiry } from '../src/api/enquiries';

const response = (status, body) =>
  Promise.resolve(new Response(body === undefined ? null : JSON.stringify(body), { status }));

describe('submitEnquiry', () => {
  it('resolves on 201', async () => {
    await expect(
      submitEnquiry({}, { fetchImpl: () => response(201, { ok: true }) }),
    ).resolves.toEqual({ ok: true });
  });

  it('turns validation errors into field codes', async () => {
    const fetchImpl = () =>
      response(400, {
        ok: false,
        error: 'validation_error',
        fields: { name: [{ code: 'blank', message: 'x' }] },
      });
    const error = await submitEnquiry({}, { fetchImpl }).catch((e) => e);
    expect(error).toBeInstanceOf(EnquiryError);
    expect(error.kind).toBe('validation');
    expect(error.fields).toEqual({ name: ['blank'] });
  });

  it.each([
    [429, { error: 'rate_limited' }, 'rate_limited'],
    [503, { error: 'service_unavailable' }, 'server'],
    [500, undefined, 'server'],
  ])('status %s -> %s', async (status, body, kind) => {
    const error = await submitEnquiry({}, { fetchImpl: () => response(status, body) }).catch(
      (e) => e,
    );
    expect(error.kind).toBe(kind);
  });

  it('reports network failures', async () => {
    const error = await submitEnquiry(
      {},
      { fetchImpl: () => Promise.reject(new TypeError('offline')) },
    ).catch((e) => e);
    expect(error.kind).toBe('network');
  });

  it('times out', async () => {
    const fetchImpl = vi.fn(
      (_url, { signal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))),
        ),
    );
    const error = await submitEnquiry({}, { fetchImpl, timeoutMs: 10 }).catch((e) => e);
    expect(error.kind).toBe('timeout');
  });

  it('never sends cookies to the API', async () => {
    const fetchImpl = vi.fn(() => response(201, { ok: true }));
    await submitEnquiry({ a: 1 }, { fetchImpl });
    expect(fetchImpl.mock.calls[0][1].credentials).toBe('omit');
  });
});
