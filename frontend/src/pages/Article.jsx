import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import LangLink from '../components/LangLink';
import { getArticle } from '../content/articles';
import { useLang } from '../hooks/useLang';
import { formatDate } from '../utils/dates';
import NotFound from './NotFound';
import '../styles/pages/article.css';

function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2>{block.text}</h2>;
    case 'ul':
    case 'ol': {
      const List = block.type;
      return (
        <List>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      );
    }
    case 'note':
      return <p className="notice">{block.text}</p>;
    default:
      return <p>{block.text}</p>;
  }
}

/** Reusable template for every article, in either language. */
export default function Article() {
  const { t } = useTranslation();
  const lang = useLang();
  const { slug } = useParams();
  const article = getArticle(slug);
  if (!article) return <NotFound message={t('articles.notFound')} />;
  const text = article[lang];

  return (
    <article className="container page page--narrow article">
      <p className="breadcrumb">
        <LangLink page="articles">← {t('articles.back')}</LangLink>
      </p>
      <h1 className="page__title">{text.title}</h1>
      <p className="article__meta">
        {t('articles.lastReviewed', { date: formatDate(article.lastReviewed, lang) })}
      </p>
      {!article.ownerReviewed && (
        <p className="notice notice--warning">{t('articles.draftNotice')}</p>
      )}
      <p className="page__intro">{text.description}</p>

      {text.body.map((block, index) => (
        <Block key={index} block={block} />
      ))}

      <section aria-labelledby="sources-title" className="article__sources">
        <h2 id="sources-title">{t('articles.sourcesTitle')}</h2>
        <ul>
          {article.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label[lang]}
                <span className="visually-hidden"> {t('common.opensNewTab')}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="article__disclaimer muted">{t('articles.disclaimer')}</p>

      <aside className="cta-box">
        <h2>{t('articles.ctaTitle')}</h2>
        <p>{t('articles.ctaText')}</p>
        <LangLink page="contact" className="button button--primary">
          {t('common.bookConsultation')}
        </LangLink>
      </aside>
    </article>
  );
}
