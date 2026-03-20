export type BookStatus = 'want' | 'reading' | 'read';

export interface Book {
  id: number;
  title: string;
  authors?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  thumbnail?: string;
  pageCount?: number;
  status: BookStatus;
  rating?: number;
  notes?: string;
  owned: boolean;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleBookInfo {
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  imageLinks?: { thumbnail?: string };
  industryIdentifiers?: { type: string; identifier: string }[];
}
