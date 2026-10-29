import { useTranslation } from 'react-i18next';

export default function LoadingState({ label }) {
  const { t } = useTranslation();
  return (
    <span className="loading" role="status">
      <span className="loading__spinner" aria-hidden="true" />
      <span>{label ?? t('common.loading')}</span>
    </span>
  );
}
