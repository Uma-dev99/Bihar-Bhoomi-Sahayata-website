import { useEffect, useRef } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LanguageChooser from '../components/LanguageChooser';
import { DEFAULT_LANGUAGE, isLanguage } from '../config/languages';
import { LangContext } from '../hooks/useLang';
import { getI18n } from '../i18n';
import NotFound from '../pages/NotFound';
import { applyMeta, resolveMeta } from '../seo/meta';

/** Wraps every /hi/... and /en/... page with the right language and the site chrome. */
export default function PublicLayout() {
  const { lang: param } = useParams();
  const valid = isLanguage(param);
  const lang = valid ? param : DEFAULT_LANGUAGE;
  return (
    <LangContext.Provider value={lang}>
      <I18nextProvider i18n={getI18n(lang)}>
        <Shell>{valid ? <Outlet /> : <NotFound />}</Shell>
      </I18nextProvider>
    </LangContext.Provider>
  );
}

export function Shell({ children }) {
  const { pathname } = useLocation();
  const lang = getI18n(useParams().lang).language;
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    applyMeta(resolveMeta(pathname, lang));
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // After client-side navigation: start at the top and move keyboard /
    // screen-reader focus to the new page's content.
    window.scrollTo?.(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, lang]);

  const skipText = getI18n(lang).t('common.skipToContent');
  return (
    <>
      <a className="skip-link" href="#main">
        {skipText}
      </a>
      <LanguageChooser />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
