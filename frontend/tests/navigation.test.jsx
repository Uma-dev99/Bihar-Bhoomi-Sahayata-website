import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../src/config/languages';
import { articles } from '../src/content/articles';
import { renderApp } from './helpers';

const pages = [
  ['/en/services/', 'Services and fees'],
  ['/en/about/', 'About the consultant'],
  ['/en/contact/', 'Request a consultation'],
  ['/en/privacy/', 'Privacy notice'],
  ['/en/disclaimer/', 'Disclaimer'],
  ['/en/articles/', 'Articles on Bihar land records'],
  ['/hi/services/', 'सेवाएँ और शुल्क'],
  ['/hi/about/', 'परामर्शदाता के बारे में'],
  ['/hi/contact/', 'परामर्श के लिए अनुरोध करें'],
  ['/hi/privacy/', 'गोपनीयता सूचना'],
  ['/hi/disclaimer/', 'अस्वीकरण'],
];

describe('routing', () => {
  it.each(pages)('%s renders its heading', (path, heading) => {
    renderApp(path);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it.each(
    articles.flatMap((a) => [
      ['hi', a],
      ['en', a],
    ]),
  )('article in %s renders', (lang, article) => {
    renderApp(`/${lang}/articles/${article.slug}/`);
    expect(
      screen.getByRole('heading', { level: 1, name: article[lang].title }),
    ).toBeInTheDocument();
    for (const source of article.sources) {
      // Match the whole label from the start: one source label can contain another's
      // opening words (e.g. "Revenue and Land Reforms Department" inside "Bihar Bhumi portal (...)").
      const label = source.label[lang].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(screen.getByRole('link', { name: new RegExp(`^${label}`) })).toHaveAttribute(
        'href',
        source.url,
      );
    }
  });

  it('shows not-found for unknown pages and languages', () => {
    renderApp('/en/no-such-page/');
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });

  it('shows not-found for an unknown article', () => {
    renderApp('/en/articles/does-not-exist/');
    expect(screen.getByText('This article could not be found.')).toBeInTheDocument();
  });

  it('shows not-found for an unsupported language', () => {
    renderApp('/fr/');
    expect(screen.getByRole('heading', { level: 1, name: 'पृष्ठ नहीं मिला' })).toBeInTheDocument();
  });

  it('main navigation moves between pages and marks the current one', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'en');
    const { user, location } = renderApp('/en/');
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    await user.click(within(nav).getByRole('link', { name: 'Services' }));
    expect(location().pathname).toBe('/en/services/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Services and fees' }),
    ).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Services' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('home page contains every required section', () => {
    renderApp('/en/');
    for (const name of [
      'How we can help',
      'Why choose this consultancy',
      'About the consultant',
      'How a consultation works',
      'Learn about land records',
      'Have a question about your land papers?',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Not a government office');
  });

  it('"Request this service" pre-selects the service on the contact form', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'en');
    const { user, location } = renderApp('/en/services/');
    const card = screen
      .getByRole('heading', { name: 'Mutation paperwork guidance' })
      .closest('article');
    await user.click(within(card).getByRole('link', { name: 'Request this service' }));
    expect(location().pathname).toBe('/en/contact/');
    expect(screen.getByLabelText(/^Service/)).toHaveValue('mutation');
  });

  it('shows placeholders instead of invented contact details', () => {
    renderApp('/en/contact/');
    expect(screen.getAllByText('To be announced').length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument();
  });
});

describe('keyboard accessibility', () => {
  it('skip link, language switcher and menu are reachable with Tab', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'en');
    const { user } = renderApp('/en/');
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus();
    await user.tab(); // brand / home link
    await user.tab();
    expect(screen.getByRole('link', { name: 'हिन्दी' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'English' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus();
  });

  it('menu button opens and closes with the keyboard', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'en');
    const { user } = renderApp('/en/');
    const button = screen.getByRole('button', { name: 'Menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    button.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('first-visit language buttons are keyboard operable', async () => {
    const { user, location } = renderApp('/hi/');
    await user.tab(); // skip link
    await user.tab();
    expect(screen.getByRole('button', { name: 'हिन्दी' })).toHaveFocus();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(location().pathname).toBe('/en/');
  });
});
