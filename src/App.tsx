import { useState, useEffect, useCallback } from 'react';
import type { Book } from './types/book';
import { api } from './services/api';
import { LibraryView } from './components/LibraryView';
import { BookForm } from './components/BookForm';
import { BookDetail } from './components/BookDetail';
import { Library, Plus } from 'lucide-react';
import './App.css';

type View = 'library' | 'add' | 'edit';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [error, setError] = useState('');

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAll();
      setBooks(data);
      setError('');
    } catch {
      setError('ไม่สามารถเชื่อมต่อ backend ได้ กรุณาตรวจสอบว่า NestJS server กำลังทำงาน');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  const handleAddBook = async (data: Partial<Book>) => {
    await api.create(data);
    await loadBooks();
    setView('library');
  };

  const handleUpdateBook = async (data: Partial<Book>) => {
    if (!selectedBook) return;
    await api.update(selectedBook.id, data);
    await loadBooks();
    setView('library');
    setShowDetail(false);
    setSelectedBook(null);
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    if (!confirm(`ลบ "${selectedBook.title}" ออกจากคลัง?`)) return;
    await api.remove(selectedBook.id);
    await loadBooks();
    setShowDetail(false);
    setSelectedBook(null);
  };

  const handleToggleFavorite = async (book: Book) => {
    await api.update(book.id, { favorite: !book.favorite });
    await loadBooks();
  };

  const handleMarkRead = async (book: Book) => {
    await api.update(book.id, { status: 'read' });
    await loadBooks();
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowDetail(true);
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Library size={24} /></div>
          <div>
            <h1>BookShelf</h1>
            <p>คลังหนังสือส่วนตัว</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${view === 'library' ? 'active' : ''}`}
            onClick={() => { setView('library'); setShowDetail(false); }}
          >
            <Library size={18} /> คลังหนังสือ
            <span className="nav-count">{books.length}</span>
          </button>
          <button
            className={`nav-item ${view === 'add' ? 'active' : ''}`}
            onClick={() => { setView('add'); setShowDetail(false); setSelectedBook(null); }}
          >
            <Plus size={18} /> เพิ่มหนังสือ
          </button>
        </nav>
        <div className="sidebar-stats">
          <div className="stat-item"><span>{books.filter(b => b.status === 'read').length}</span><label>อ่านแล้ว</label></div>
          <div className="stat-item"><span>{books.filter(b => b.status === 'reading').length}</span><label>กำลังอ่าน</label></div>
          <div className="stat-item"><span>{books.filter(b => b.status === 'want').length}</span><label>อยากอ่าน</label></div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {error && <div className="error-banner">{error}</div>}

        {view === 'library' && (
          <LibraryView
            books={books}
            loading={loading}
            onBookClick={handleBookClick}
            onAddBook={() => setView('add')}
            onToggleFavorite={handleToggleFavorite}
            onMarkRead={handleMarkRead}
          />
        )}

        {view === 'add' && (
          <BookForm
            onSubmit={handleAddBook}
            onCancel={() => setView('library')}
          />
        )}

        {view === 'edit' && selectedBook && (
          <BookForm
            initialData={selectedBook}
            onSubmit={handleUpdateBook}
            onCancel={() => { setView('library'); setShowDetail(false); }}
            isEdit
          />
        )}
      </main>

      {/* Detail modal */}
      {showDetail && selectedBook && (
        <BookDetail
          book={selectedBook}
          onClose={() => setShowDetail(false)}
          onEdit={() => { setView('edit'); setShowDetail(false); }}
          onDelete={handleDeleteBook}
        />
      )}
    </div>
  );
}
