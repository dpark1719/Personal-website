import { useEffect } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import BookShelf from './components/BookShelf';
import Experiences from './components/Experiences';
import Goals from './components/Goals';
import Values from './components/Values';
import Interests from './components/Interests';
import Footer from './components/Footer';

export default function App() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Nav />
      <Hero />
      <BookShelf />
      <Experiences />
      <Goals />
      <Values />
      <Interests />
      <Footer />
    </>
  );
}
