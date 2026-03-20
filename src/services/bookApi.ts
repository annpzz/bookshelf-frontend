import type { GoogleBookInfo } from '../types/book';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const OPEN_LIBRARY_API = 'https://openlibrary.org/api/books';

export async function fetchBookByISBN(isbn: string): Promise<Partial<GoogleBookInfo> | null> {
  // 1. Try Google Books API
  try {
    const res = await fetch(`${GOOGLE_BOOKS_API}?q=isbn:${isbn}&maxResults=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].volumeInfo as GoogleBookInfo;
      }
    }
  } catch (error) {
    console.warn('Google Books API failed, trying OpenLibrary...', error);
  }

  // 2. Fallback to OpenLibrary API
  try {
    const res = await fetch(`${OPEN_LIBRARY_API}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    if (res.ok) {
      const data = await res.json();
      const bookData = data[`ISBN:${isbn}`];
      
      if (bookData) {
        return {
          title: bookData.title,
          authors: bookData.authors?.map((a: { name: string }) => a.name) || [],
          publisher: bookData.publishers?.[0]?.name,
          publishedDate: bookData.publish_date,
          pageCount: bookData.number_of_pages,
          description: bookData.notes || '',
          imageLinks: {
            thumbnail: bookData.cover?.large || bookData.cover?.medium,
          },
        };
      }
    }
  } catch (error) {
    console.error('OpenLibrary API failed too:', error);
  }

  return null;
}
