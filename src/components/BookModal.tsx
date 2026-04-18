import type { Book } from '../types';

interface Props {
  book: Book | null;
  onClose: () => void;
}

function coverUrl(isbn: string) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
}

function amazonUrl(title: string, author: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(title + ' ' + author)}`;
}

export default function BookModal({ book, onClose }: Props) {
  if (!book) return null;

  return (
    <div
      className={`book-modal-overlay${book ? ' open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="book-modal">
        <button className="book-modal-close" onClick={onClose}>&times;</button>

        <div className="book-modal-header">
          <div className="book-modal-cover">
            <img
              src={coverUrl(book.isbn)}
              alt={book.title}
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = document.createElement('div');
                fallback.className = 'book-modal-cover-fallback';
                fallback.style.background = book.color;
                fallback.textContent = book.title;
                img.replaceWith(fallback);
              }}
            />
          </div>
          <div className="book-modal-info">
            <h2>{book.title}</h2>
            <p className="book-modal-author">{book.author}</p>
            <p className="book-modal-summary">{book.summary}</p>
            <a
              className="amazon-btn"
              href={amazonUrl(book.title, book.author)}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Amazon
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 1.5l1 1L3.7 6.5H14v1.5H3.7l3.8 4-1 1L1 7.25z" transform="rotate(180 8 8)" />
              </svg>
            </a>
          </div>
        </div>

        <div className="book-modal-body">
          <div className="book-modal-section">
            <h3>My Takeaways</h3>
            <p>{book.takeaway}</p>
          </div>
          <div className="book-modal-section">
            <h3>Favorite Quotes</h3>
            {book.quotes.map((q, i) => (
              <div key={i} className="quote-block">
                <p>&ldquo;{q}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
