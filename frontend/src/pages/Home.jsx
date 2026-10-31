import { useTranslation } from 'react-i18next';
import ArticleCard from '../components/ArticleCard';
import LangLink from '../components/LangLink';
import ServiceCard from '../components/ServiceCard';
import { articles } from '../content/articles';
import { services } from '../content/services';
import '../styles/pages/home.css';

export default function Home() {
  const { t } = useTranslation();
  const why = t('home.why', { returnObjects: true });
  const steps = t('home.process', { returnObjects: true });

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <h1 className="hero__title">{t('home.headline')}</h1>
          <p className="hero__intro">{t('home.intro')}</p>
          <p className="hero__note">{t('home.heroNote')}</p>
          <div className="hero__actions">
            <LangLink page="contact" className="button button--primary button--large">
              {t('common.bookConsultation')}
            </LangLink>
            <LangLink page="services" className="button button--ghost button--large">
              {t('home.secondaryCta')}
            </LangLink>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="home-services">
        <div className="container">
          <h2 id="home-services" className="section__title">
            {t('home.servicesTitle')}
          </h2>
          <p className="section__intro">{t('home.servicesIntro')}</p>
          <div className="card-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <p className="section__more">
            <LangLink page="services">{t('home.allServices')} →</LangLink>
          </p>
        </div>
      </section>

      <section className="section section--tinted" aria-labelledby="home-why">
        <div className="container">
          <h2 id="home-why" className="section__title">
            {t('home.whyTitle')}
          </h2>
          <ul className="feature-list">
            {why.map((item) => (
              <li key={item.title} className="feature">
                <h3 className="feature__title">{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="home-bio">
        <div className="container bio">
          <div className="bio__photo" aria-hidden="true">
            <span>{t('about.name').slice(0, 1)}</span>
          </div>
          <div>
            <h2 id="home-bio" className="section__title">
              {t('home.bioTitle')}
            </h2>
            <p>{t('home.bioText')}</p>
            <p>
              <LangLink page="about">{t('home.bioLink')} →</LangLink>
            </p>
          </div>
        </div>
      </section>

      <section className="section section--tinted" aria-labelledby="home-process">
        <div className="container">
          <h2 id="home-process" className="section__title">
            {t('home.processTitle')}
          </h2>
          <ol className="steps">
            {steps.map((step) => (
              <li key={step.title} className="steps__item">
                <h3 className="steps__title">{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="home-articles">
        <div className="container">
          <h2 id="home-articles" className="section__title">
            {t('home.articlesTitle')}
          </h2>
          <div className="card-grid">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          <p className="section__more">
            <LangLink page="articles">{t('home.allArticles')} →</LangLink>
          </p>
        </div>
      </section>

      <section className="section cta-band" aria-labelledby="home-contact">
        <div className="container cta-band__inner">
          <div>
            <h2 id="home-contact" className="section__title">
              {t('home.contactTitle')}
            </h2>
            <p>{t('home.contactText')}</p>
          </div>
          <LangLink page="contact" className="button button--light button--large">
            {t('common.bookConsultation')}
          </LangLink>
        </div>
      </section>
    </>
  );
}
