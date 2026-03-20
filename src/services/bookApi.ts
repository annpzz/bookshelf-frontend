import type { GoogleBookInfo } from '../types/book';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function fetchBookByISBN(isbn: string): Promise<Partial<GoogleBookInfo> | null> {
  try {
    const res = await fetch(`${GOOGLE_BOOKS_API}?q=isbn:${isbn}&maxResults=1`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;
    const info: GoogleBookInfo = data.items[0].volumeInfo;
    return info;
  } catch {
    return null;
  }
}
