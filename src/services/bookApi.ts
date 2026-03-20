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

  // 3. Fallback to Thai Bookstores (SE-ED) via CORS Proxy
  try {
    const seedUrl = `https://www.se-ed.com/product/search.aspx?keyword=${isbn}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(seedUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const html = await res.text();
      if (html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const titleNode = doc.querySelector('meta[property="og:title"]');
        const imageNode = doc.querySelector('meta[property="og:image"]');
        
        let title = titleNode ? titleNode.getAttribute('content') : '';
        const imageUrl = imageNode ? imageNode.getAttribute('content') : '';
        
        // Clean up SE-ED title suffix such as " | SE-ED"
        title = title?.replace(/\s*\|\s*SE-ED.*$/i, '')?.replace(/\s*-\s*ร้านหนังสืออีบุ๊ค.*$/i, '')?.trim() || '';

        // SE-ED Search page has title "ค้นหา: 978..." if no book redirects. We only want actual product page hits.
        if (title && !title.includes('ค้นหา:') && !title.includes('Search:')) {
          return {
            title,
            imageLinks: imageUrl ? { thumbnail: imageUrl } : undefined,
          };
        }
      }
    }
  } catch (error) {
    console.error('Thai bookstore proxy failed:', error);
  }

  return null;
}
