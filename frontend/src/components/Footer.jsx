import { useTranslation } from 'react-i18next';
import LangLink from './LangLink';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <p className="site-footer__name">{t('meta.siteName')}</p>
          <p>{t('footer.about')}</p>
          <p className="site-footer__notice">{t('common.independentNotice')}</p>
        </div>
        <nav aria-label={t('footer.linksTitle')}>
          <h2 className="site-footer__heading">{t('footer.linksTitle')}</h2>
          <ul>
            {['home', 'services', 'articles', 'about', 'contact'].map((page) => (
              <li key={page}>
                <LangLink page={page}>{t(`nav.${page}`)}</LangLink>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t('footer.legalTitle')}>
          <h2 className="site-footer__heading">{t('footer.legalTitle')}</h2>
          <ul>
            <li>
              <LangLink page="privacy">{t('nav.privacy')}</LangLink>
            </li>
            <li>
              <LangLink page="disclaimer">{t('nav.disclaimer')}</LangLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="container site-footer__bottom">
        <p>{t('footer.copyright', { year })}</p>
      </div>
    </footer>
  );
}
