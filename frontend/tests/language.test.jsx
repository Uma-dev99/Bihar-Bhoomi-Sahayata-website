import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, switchLanguagePath } from '../src/config/languages';
import { renderApp } from './helpers';

const HI_HEADLINE = 'जमीन के कागजात समझिए, सही अगला कदम जानिए।';
const EN_HEADLINE = 'Understand your land records. Know your next step.';

describe('language behaviour', () => {
  it('defaults to Hindi on a first visit to /', async () => {
    const { location } = renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: HI_HEADLINE })).toBeInTheDocument();
    expect(location().pathname).toBe('/hi/');
    await waitFor(() => expect(document.documentElement.lang).toBe('hi'));
  });

  it('opens in the saved language when one exists', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'en');
    const { location } = renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: EN_HEADLINE })).toBeInTheDocument();
    expect(location().pathname).toBe('/en/');
  });

  it('ignores an invalid saved value', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'fr');
    renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: HI_HEADLINE })).toBeInTheDocument();
  });

  it('shows the Hindi and English choice prominently on a first visit', async () => {
    renderApp('/hi/');
    const chooser = await screen.findByRole('region', { name: /अपनी भाषा चुनें/ });
    expect(within(chooser).getByRole('button', { name: 'हिन्दी' })).toBeInTheDocument();
    expect(within(chooser).getByRole('button', { name: 'English' })).toBeInTheDocument();
  });

  it('choosing English in the first-visit prompt switches and remembers it', async () => {
    const { user, location } = renderApp('/hi/');
    const chooser = await screen.findByRole('region', { name: /अपनी भाषा चुनें/ });
    await user.click(within(chooser).getByRole('button', { name: 'English' }));
    expect(await screen.findByRole('heading', { level: 1, name: EN_HEADLINE })).toBeInTheDocument();
    expect(location().pathname).toBe('/en/');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('en');
    expect(screen.queryByRole('region', { name: /choose your language/i })).not.toBeInTheDocument();
  });

  it('does not show the prompt once a language has been chosen', () => {
    window.localStorage.setItem(STORAGE_KEY, 'hi');
    renderApp('/hi/');
    expect(screen.queryByRole('region', { name: /अपनी भाषा चुनें/ })).not.toBeInTheDocument();
  });

  it('header switcher keeps the same page, updates text, lang attribute and storage', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'hi');
    const { user, location } = renderApp('/hi/services/');
    expect(screen.getByRole('heading', { level: 1, name: 'सेवाएँ और शुल्क' })).toBeInTheDocument();

    const switcher = screen.getByRole('navigation', { name: 'भाषा' });
    await user.click(within(switcher).getByRole('link', { name: 'English' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Services and fees' }),
    ).toBeInTheDocument();
    expect(location().pathname).toBe('/en/services/');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('en');
    await waitFor(() => expect(document.documentElement.lang).toBe('en'));
    expect(document.title).toBe('Services and fees – Bihar Bhoomi Sahayata');
    // No Hindi interface text left behind in the navigation.
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveTextContent(
      'Services',
    );
  });

  it('marks the current language in the switcher', () => {
    renderApp('/en/about/');
    const switcher = screen.getByRole('navigation', { name: 'Language' });
    expect(within(switcher).getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(within(switcher).getByRole('link', { name: 'हिन्दी' })).toHaveAttribute(
      'href',
      '/hi/about/',
    );
  });

  it('builds the other-language path correctly', () => {
    expect(switchLanguagePath('/hi/articles/some-slug/', 'en')).toBe('/en/articles/some-slug/');
    expect(switchLanguagePath('/', 'en')).toBe('/en/');
  });

  it('formats prices in rupees', () => {
    renderApp('/en/services/');
    expect(screen.getAllByText('₹199').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹1,499').length).toBeGreaterThan(0);
    expect(screen.getByText('Quote after scope assessment')).toBeInTheDocument();
  });
});
