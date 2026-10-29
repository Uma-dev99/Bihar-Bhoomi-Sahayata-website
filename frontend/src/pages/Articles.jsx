import { useTranslation } from 'react-i18next';
import ArticleCard from '../components/ArticleCard';
import { articles } from '../content/articles';

export default function Articles() {
  const { t } = useTranslation();
  return (
    <div className="container page">
      <h1 className="page__title">{t('articles.title')}</h1>
      <p className="page__intro">{t('articles.intro')}</p>
      <div className="card-grid">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} headingLevel={2} />
        ))}
      </div>
    </div>
  );
}
