import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_LABELS, LANGUAGES, storeLanguage, switchLanguagePath } from '../config/languages';
import { useLang } from '../hooks/useLang';
import '../styles/components/language-switcher.css';

/**
 * Always-visible Hindi / English switch. Each option is a real link to the
 * same page in the other language, so it works without JavaScript and
 * search engines can follow it. Choosing a language also saves it.
 */
export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const lang = useLang();
  const { pathname, search } = useLocation();

  return (
    <nav className="lang-switch" aria-label={t('language.label')}>
      {LANGUAGES.map((code) => {
        const active = code === lang;
        return (
          <Link
            key={code}
            to={`${switchLanguagePath(pathname, code)}${search}`}
            lang={code}
            hrefLang={code}
            className={active ? 'lang-switch__option is-active' : 'lang-switch__option'}
            aria-current={active ? 'true' : undefined}
            title={active ? undefined : t('language.switchTo', { language: LANGUAGE_LABELS[code] })}
            onClick={() => storeLanguage(code)}
          >
            {LANGUAGE_LABELS[code]}
          </Link>
        );
      })}
    </nav>
  );
}
