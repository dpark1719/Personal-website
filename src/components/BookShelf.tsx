import { useMemo, useState, useRef, useCallback } from 'react';
import { bookData } from '../data/books';
import { categoryLabels, type Book, type BookCategory } from '../types';
import { useReveal } from '../hooks/useReveal';
import BookModal from './BookModal';

function defaultCoverUrl(isbn: string) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
}

function sortBooks(books: Book[]): Book[] {
  return [...books].sort((a, b) =>
    a.title.replace(/^(The|A|An) /i, '').localeCompare(
      b.title.replace(/^(The|A|An) /i, ''),
    ),
  );
}

const DOCK_MAX = 0.18;
const DOCK_RADIUS = 160;

function BookItem({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <div className="book-item" onClick={onClick}>
      <div className="book-spine">
        <div className="book-cover">
          <img
            src={book.coverUrl ?? defaultCoverUrl(book.isbn)}
            alt={book.title}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              const fallback = document.createElement('div');
              fallback.className = 'book-cover-fallback';
              fallback.style.background = book.color;
              fallback.textContent = book.title;
              img.replaceWith(fallback);
            }}
          />
        </div>
        <div className="book-pages" />
      </div>
      <div className="book-tooltip">
        <h4>{book.title}</h4>
        <div className="tooltip-author">{book.author}</div>
        <div className="tooltip-summary">{book.summary}</div>
      </div>
    </div>
  );
}

function ShelfCategory({ category, books }: { category: BookCategory; books: Book[] }) {
  const ref = useReveal<HTMLDivElement>();
  const shelfRef = useRef<HTMLDivElement>(null);
  const sorted = useMemo(() => sortBooks(books), [books]);
  const [selected, setSelected] = useState<Book | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const mx = e.clientX;
    const spines = shelf.querySelectorAll<HTMLElement>('.book-spine');
    spines.forEach((sp) => {
      const rect = sp.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(mx - center);
      const t = Math.min(dist / DOCK_RADIUS, 1);
      const s = 1 + DOCK_MAX * Math.cos(t * Math.PI * 0.5) ** 2;
      sp.style.transform = `scale(${s.toFixed(4)})`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    shelfRef.current
      ?.querySelectorAll<HTMLElement>('.book-spine')
      .forEach((sp) => { sp.style.transform = ''; });
  }, []);

  return (
    <>
      <div className="shelf-category reveal" ref={ref}>
        <h3 className="shelf-label">{categoryLabels[category]}</h3>
        <div
          className="shelf"
          ref={shelfRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {sorted.map((book) => (
            <BookItem key={book.isbn} book={book} onClick={() => setSelected(book)} />
          ))}
        </div>
      </div>
      <BookModal book={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default function BookShelf() {
  const ref = useReveal<HTMLElement>();

  return (
    <section className="section" id="books" ref={ref}>
      <div className="container-wide">
        <h2 className="section-title reveal">Books I've Read</h2>
        <p className="section-subtitle reveal">
          Hover over a cover to preview. Click to explore quotes and takeaways.
        </p>
        {(Object.entries(bookData) as [BookCategory, Book[]][]).map(([cat, books]) => (
          <ShelfCategory key={cat} category={cat} books={books} />
        ))}
      </div>
    </section>
  );
}
