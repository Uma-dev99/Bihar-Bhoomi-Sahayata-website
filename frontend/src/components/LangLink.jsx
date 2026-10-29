import { Link, NavLink } from 'react-router';
import { pagePath } from '../config/routes';
import { useLang } from '../hooks/useLang';

/** Link to a page in the current language: <LangLink page="services">. */
export function LangLink({ page, slug, search = '', nav = false, children, ...props }) {
  const lang = useLang();
  const to = `${pagePath(lang, page, slug)}${search}`;
  if (nav) {
    return (
      <NavLink to={to} end={page === 'home'} {...props}>
        {children}
      </NavLink>
    );
  }
  return (
    <Link to={to} {...props}>
      {children}
    </Link>
  );
}

export default LangLink;
