import { useEffect, useId, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import LangLink from './LangLink';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';

const NAV_ITEMS = ['home', 'services', 'articles', 'about', 'contact'];

export default function Header() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Close the mobile menu after navigating, and with the Escape key.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <LangLink page="home" className="brand">
          <Logo />
          <span className="brand__name">{t('meta.siteName')}</span>
        </LangLink>

        <div className="site-header__tools">
          <LanguageSwitcher />
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="menu-toggle__icon" aria-hidden="true" />
            {open ? t('nav.closeMenu') : t('nav.menu')}
          </button>
        </div>

        <nav
          id={menuId}
          className={open ? 'main-nav is-open' : 'main-nav'}
          aria-label={t('nav.label')}
        >
          <ul className="main-nav__list">
            {NAV_ITEMS.map((page) => (
              <li key={page}>
                <LangLink page={page} nav className="main-nav__link">
                  {t(`nav.${page}`)}
                </LangLink>
              </li>
            ))}
          </ul>
          <LangLink page="contact" className="button button--primary main-nav__cta">
            {t('common.bookConsultation')}
          </LangLink>
        </nav>
      </div>
    </header>
  );
}
