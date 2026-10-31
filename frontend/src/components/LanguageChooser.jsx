import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  getStoredLanguage,
  LANGUAGE_LABELS,
  LANGUAGES,
  storeLanguage,
  switchLanguagePath,
} from '../config/languages';
import { getI18n } from '../i18n';
import { useLang } from '../hooks/useLang';
import '../styles/components/language-chooser.css';

/**
 * First-visit prompt: shown until the visitor picks a language once.
 * It appears only after the page has loaded in the browser, so the
 * prerendered HTML stays identical for every visitor.
 */
export default function LanguageChooser() {
  const { t } = useTranslation();
  const lang = useLang();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredLanguage() === null);
  }, []);

  if (!visible) return null;

  const choose = (code) => {
    storeLanguage(code);
    setVisible(false);
    if (code !== lang) navigate(`${switchLanguagePath(pathname, code)}${search}`);
  };

  // The prompt is written in both languages so everyone can read it.
  const other = LANGUAGES.find((code) => code !== lang);
  return (
    <section className="lang-chooser" aria-labelledby="lang-chooser-title">
      <div className="container lang-chooser__inner">
        <div>
          <h2 id="lang-chooser-title" className="lang-chooser__title">
            {t('language.chooserTitle')}
            <span lang={other}> / {getI18n(other).t('language.chooserTitle')}</span>
          </h2>
          <p className="lang-chooser__text">{t('language.chooserText')}</p>
        </div>
        <div
          className="lang-chooser__buttons"
          role="group"
          aria-label={t('language.chooserGroupLabel')}
        >
          {LANGUAGES.map((code) => (
            <button
              key={code}
              type="button"
              lang={code}
              className={code === lang ? 'button button--primary' : 'button button--secondary'}
              onClick={() => choose(code)}
            >
              {LANGUAGE_LABELS[code]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
