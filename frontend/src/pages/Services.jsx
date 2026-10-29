import { useTranslation } from 'react-i18next';
import ServiceCard from '../components/ServiceCard';
import { services } from '../content/services';

export default function Services() {
  const { t } = useTranslation();
  const notes = t('services.feesNote', { returnObjects: true });

  return (
    <div className="container page">
      <h1 className="page__title">{t('services.title')}</h1>
      <p className="page__intro">{t('services.intro')}</p>

      <div className="card-grid card-grid--wide">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} detailed headingLevel={2} />
        ))}
      </div>

      <aside className="notice" aria-labelledby="fees-note">
        <h2 id="fees-note" className="notice__title">{t('services.feesNoteTitle')}</h2>
        <ul>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
