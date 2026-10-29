import { useTranslation } from 'react-i18next';
import EnquiryForm from '../components/EnquiryForm';
import LangLink from '../components/LangLink';
import { business } from '../config/business';
import { useLang } from '../hooks/useLang';

export default function Contact() {
  const { t } = useTranslation();
  const lang = useLang();
  const instructions = t('contact.instructions', { returnObjects: true });
  const tba = <span className="muted">{t('common.toBeAnnounced')}</span>;

  return (
    <div className="container page">
      <h1 className="page__title">{t('contact.title')}</h1>
      <p className="page__intro">{t('contact.intro')}</p>

      <div className="contact-layout">
        <section aria-labelledby="form-title" className="panel">
          <h2 id="form-title">{t('form.title')}</h2>
          <EnquiryForm />
        </section>

        <div className="contact-side">
          <section aria-labelledby="details-title" className="panel">
            <h2 id="details-title">{t('contact.detailsTitle')}</h2>
            <dl className="details">
              <dt>{t('contact.location')}</dt>
              <dd>{t('contact.locationValue')}</dd>
              <dt>{t('contact.phone')}</dt>
              <dd>{business.phone ? <a href={`tel:${business.phone}`}>{business.phone}</a> : tba}</dd>
              <dt>{t('contact.whatsapp')}</dt>
              <dd>
                {business.whatsapp ? (
                  <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    {t('contact.whatsappLink')} <span className="visually-hidden">{t('common.opensNewTab')}</span>
                  </a>
                ) : (
                  tba
                )}
              </dd>
              {business.email && (
                <>
                  <dt>{t('contact.email')}</dt>
                  <dd>
                    <a href={`mailto:${business.email}`}>{business.email}</a>
                  </dd>
                </>
              )}
              <dt>{t('contact.hours')}</dt>
              <dd>{business.hours?.[lang] ?? tba}</dd>
            </dl>
          </section>

          <section aria-labelledby="instructions-title" className="panel">
            <h2 id="instructions-title">{t('contact.instructionsTitle')}</h2>
            <ul>
              {instructions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <p className="notice notice--small">
            {t('common.independentNotice')} <LangLink page="disclaimer">{t('nav.disclaimer')}</LangLink>
            {' · '}
            <LangLink page="privacy">{t('nav.privacy')}</LangLink>
          </p>
        </div>
      </div>
    </div>
  );
}
