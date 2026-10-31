import { useTranslation } from 'react-i18next';
import '../styles/pages/disclaimer.css';

export default function Disclaimer() {
  const { t } = useTranslation();
  const points = t('disclaimer.points', { returnObjects: true });

  return (
    <div className="container page page--narrow">
      <h1 className="page__title">{t('disclaimer.title')}</h1>
      <ul className="spaced-list">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
