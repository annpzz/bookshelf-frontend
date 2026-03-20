import type { Book } from '../types/book';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/books`;

export const api = {
  async getAll(): Promise<Book[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch books');
    return res.json();
  },

  async getOne(id: number): Promise<Book> {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error('Book not found');
    return res.json();
  },

  async create(data: Partial<Book>): Promise<Book> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create book');
    return res.json();
  },

  async update(id: number, data: Partial<Book>): Promise<Book> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update book');
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete book');
  },
};
