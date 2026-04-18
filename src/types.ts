export interface Book {
  title: string;
  author: string;
  isbn: string;
  color: string;
  summary: string;
  takeaway: string;
  quotes: [string, string, string];
  coverUrl?: string;
}

export type BookCategory =
  | 'life'
  | 'biography'
  | 'nonfiction'
  | 'fiction'
  | 'social'
  | 'entrepreneurship'
  | 'finance'
  | 'spirituality'
  | 'history';

export type BookData = Record<BookCategory, Book[]>;

export const categoryLabels: Record<BookCategory, string> = {
  life: 'Life',
  biography: 'Biography',
  nonfiction: 'Nonfiction',
  fiction: 'Fiction',
  social: 'Social & Relationships',
  entrepreneurship: 'Entrepreneurship',
  finance: 'Finance',
  spirituality: 'Spirituality & Religion',
  history: 'History',
};
