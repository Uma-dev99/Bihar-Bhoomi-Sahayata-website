import { useTranslation } from 'react-i18next';
import LangLink from '../components/LangLink';

export default function NotFound({ message }) {
  const { t } = useTranslation();
  return (
    <div className="container page page--narrow">
      <h1 className="page__title">{t('notFound.title')}</h1>
      <p>{message ?? t('notFound.text')}</p>
      <p>
        <LangLink page="home" className="button button--primary">
          {t('notFound.home')}
        </LangLink>
      </p>
    </div>
  );
}
