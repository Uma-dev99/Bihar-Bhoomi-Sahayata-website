import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '../src/config/languages';
import { jsonResponse, renderApp } from './helpers';

async function fillValidForm(user) {
  await user.type(screen.getByLabelText(/^Your name/), 'Example Customer');
  await user.type(screen.getByLabelText(/^Mobile number/), '9000000000');
  await user.selectOptions(screen.getByLabelText(/^Service/), 'jamabandi');
  await user.selectOptions(screen.getByLabelText(/^District/), 'gaya');
  await user.type(screen.getByLabelText(/^Your question/), 'I need guidance about a land-record entry.');
  await user.click(screen.getByLabelText(/I have read the privacy notice/));
}

function setup(lang = 'en') {
  window.localStorage.setItem(STORAGE_KEY, lang);
  return renderApp(`/${lang}/contact/`);
}

describe('enquiry form', () => {
  it('shows translated errors and does not call the API when empty', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please correct the highlighted fields.');
    expect(screen.getByLabelText(/^Your name/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/^Your name/)).toHaveFocus();
    expect(screen.getAllByText('This field is required.').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('Please accept the privacy notice to continue.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows errors in Hindi on the Hindi page', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const { user } = setup('hi');
    await user.click(screen.getByRole('button', { name: 'पूछताछ भेजें' }));
    expect(screen.getByRole('alert')).toHaveTextContent('कृपया चिह्नित खानों को ठीक करें।');
    expect(screen.getAllByText('यह खाना भरना ज़रूरी है।').length).toBeGreaterThan(0);
  });

  it('rejects whitespace-only names, short messages and bad phone numbers', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const { user } = setup();
    await user.type(screen.getByLabelText(/^Your name/), '    ');
    await user.type(screen.getByLabelText(/^Mobile number/), '12345');
    await user.type(screen.getByLabelText(/^Your question/), 'help');
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(screen.getByText('Please enter a valid mobile number.')).toBeInTheDocument();
    expect(screen.getByText(/at least 10 characters/)).toBeInTheDocument();
    expect(screen.getAllByText('This field is required.').length).toBeGreaterThan(0);
  });

  it('sends the enquiry, shows loading and then success', async () => {
    let resolve;
    const fetchMock = vi.fn(() => new Promise((r) => (resolve = r)));
    vi.stubGlobal('fetch', fetchMock);
    const { user } = setup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    // Loading state
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Sending…');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/enquiries\/$/);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      name: 'Example Customer',
      phone: '9000000000',
      preferred_language: 'en',
      service_type: 'jamabandi',
      district: 'gaya',
      message: 'I need guidance about a land-record entry.',
      privacy_accepted: true,
      website: '',
    });

    resolve(await jsonResponse(201, { ok: true }));
    expect(await screen.findByText('Thank you – your enquiry has been received.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send another enquiry' }));
    expect(screen.getByLabelText(/^Your name/)).toHaveValue('');
  });

  it('shows server-side validation errors next to the right field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        jsonResponse(400, {
          ok: false,
          error: 'validation_error',
          fields: { phone: [{ code: 'invalid', message: 'Enter a valid phone number.' }] },
        }),
      ),
    );
    const { user } = setup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(await screen.findByText('Please enter a valid mobile number.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mobile number/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('explains when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))));
    const { user } = setup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the server');
    // The visitor's text is kept so they can try again.
    expect(screen.getByLabelText(/^Your name/)).toHaveValue('Example Customer');
  });

  it('explains rate limiting', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse(429, { ok: false, error: 'rate_limited' })));
    const { user } = setup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many enquiries');
  });

  it('shows a generic error for server failures', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('<h1>502</h1>', { status: 502 }))));
    const { user } = setup();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong on our side');
  });

  it('defaults the call-back language to the page language', () => {
    setup('hi');
    expect(screen.getByRole('radio', { name: 'हिन्दी' })).toBeChecked();
  });

  it('lists Bihar districts in the page language', () => {
    setup('hi');
    expect(screen.getByRole('option', { name: 'गया' })).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBeGreaterThan(38);
  });

  it('keeps the honeypot out of the keyboard order and accessibility tree', () => {
    setup();
    const honeypot = document.querySelector('input[name="website"]');
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('shows a slow-server message during long requests', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    const { user } = setup();
    await fillValidForm(user);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
    vi.advanceTimersByTime(7000);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('wake up'));
  });
});
