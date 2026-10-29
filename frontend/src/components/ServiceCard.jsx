import { useTranslation } from 'react-i18next';
import { formatINR } from '../config/languages';
import { useLang } from '../hooks/useLang';
import LangLink from './LangLink';

/** One service. `detailed` adds scope, deliverable and limits (Services page). */
export default function ServiceCard({ service, detailed = false, headingLevel = 3 }) {
  const { t } = useTranslation();
  const lang = useLang();
  const Heading = `h${headingLevel}`;
  const key = `services.items.${service.id}`;
  const fee = service.fee == null ? t('services.quote') : formatINR(service.fee, lang);

  return (
    <article className="service-card">
      <Heading className="service-card__title">{t(`${key}.name`)}</Heading>
      <p className={service.fee == null ? 'service-card__fee service-card__fee--quote' : 'service-card__fee'}>
        <span className="visually-hidden">{t('services.feeLabel')}: </span>
        {fee}
      </p>
      {detailed ? (
        <dl className="service-card__details">
          <dt>{t('services.scopeLabel')}</dt>
          <dd>{t(`${key}.scope`)}</dd>
          <dt>{t('services.deliverableLabel')}</dt>
          <dd>{t(`${key}.deliverable`)}</dd>
          <dt>{t('services.limitsLabel')}</dt>
          <dd>{t(`${key}.limits`)}</dd>
        </dl>
      ) : (
        <p className="service-card__summary">{t(`${key}.scope`)}</p>
      )}
      {detailed && (
        <LangLink page="contact" search={`?service=${service.id}`} className="button button--secondary">
          {t('services.requestThis')}
        </LangLink>
      )}
    </article>
  );
}
