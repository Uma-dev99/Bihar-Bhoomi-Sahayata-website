import { useTranslation } from 'react-i18next';
import LangLink from '../components/LangLink';
import { business } from '../config/business';
import '../styles/pages/about.css';

export default function About() {
  const { t } = useTranslation();
  const approach = t('about.approach', { returnObjects: true });

  return (
    <div className="container page page--narrow">
      <h1 className="page__title">{t('about.title')}</h1>

      <div className="profile">
        {business.ownerPhoto ? (
          <img
            className="profile__photo"
            src={business.ownerPhoto}
            alt={t('about.name')}
            width="160"
            height="160"
          />
        ) : (
          <div className="profile__photo profile__photo--placeholder">
            <span>{t('about.photoPlaceholder')}</span>
          </div>
        )}
        <div>
          <p className="profile__name">{t('about.name')}</p>
          <p className="profile__role">{t('about.role')}</p>
        </div>
      </div>

      <p>{t('about.intro')}</p>

      <h2>{t('about.independentTitle')}</h2>
      <p>{t('about.independentText')}</p>

      <h2>{t('about.languagesTitle')}</h2>
      <p>{t('about.languagesText')}</p>

      <h2>{t('about.approachTitle')}</h2>
      <ul>
        {approach.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p>
        <LangLink page="contact" className="button button--primary">
          {t('common.bookConsultation')}
        </LangLink>
      </p>
    </div>
  );
}
