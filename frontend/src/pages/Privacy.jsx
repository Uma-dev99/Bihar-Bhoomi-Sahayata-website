import { useTranslation } from 'react-i18next';
import { useLang } from '../hooks/useLang';
import { formatDate } from '../utils/dates';

// Update this date whenever the privacy notice text changes.
export const PRIVACY_LAST_UPDATED = '2026-10-29';

export default function Privacy() {
  const { t } = useTranslation();
  const lang = useLang();
  const sections = t('privacy.sections', { returnObjects: true });

  return (
    <div className="container page page--narrow">
      <h1 className="page__title">{t('privacy.title')}</h1>
      <p className="muted">
        {t('privacy.lastUpdated', { date: formatDate(PRIVACY_LAST_UPDATED, lang) })}
      </p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
