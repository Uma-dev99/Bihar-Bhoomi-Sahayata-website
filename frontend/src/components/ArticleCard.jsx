import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/dates';
import { useLang } from '../hooks/useLang';
import LangLink from './LangLink';
import '../styles/components/article-card.css';

export default function ArticleCard({ article, headingLevel = 3 }) {
  const { t } = useTranslation();
  const lang = useLang();
  const Heading = `h${headingLevel}`;
  const text = article[lang];

  return (
    <article className="article-card">
      <Heading className="article-card__title">
        <LangLink page="articles" slug={article.slug}>
          {text.title}
        </LangLink>
      </Heading>
      <p>{text.description}</p>
      <p className="article-card__meta">
        {t('articles.lastReviewed', { date: formatDate(article.lastReviewed, lang) })}
      </p>
    </article>
  );
}
