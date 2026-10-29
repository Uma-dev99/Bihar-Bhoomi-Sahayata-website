import { Navigate, Route, Routes } from 'react-router';
import { DEFAULT_LANGUAGE, getStoredLanguage } from './config/languages';
import PublicLayout from './layouts/PublicLayout';
import About from './pages/About';
import Article from './pages/Article';
import Articles from './pages/Articles';
import Contact from './pages/Contact';
import Disclaimer from './pages/Disclaimer';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Services from './pages/Services';

/** "/" sends visitors to their saved language, or Hindi on a first visit. */
function RootRedirect() {
  return <Navigate to={`/${getStoredLanguage() ?? DEFAULT_LANGUAGE}/`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path=":lang" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:slug" element={<Article />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="disclaimer" element={<Disclaimer />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
