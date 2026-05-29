const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/books - List all books (with search, filter, pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (title LIKE ? OR author LIKE ? OR book_code LIKE ? OR isbn LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // Whitelist sort columns
    const allowedSorts = ['title', 'author', 'category', 'created_at', 'quantity', 'available'];
    const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM books WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [books] = await pool.query(
      `SELECT * FROM books WHERE ${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get books error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/books/search - Search books (for autocomplete)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const [books] = await pool.query(
      'SELECT id, book_code, title, author, available FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? LIMIT 10',
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json({ success: true, data: books });
  } catch (err) {
    console.error('Search books error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/books/:id - Get single book
router.get('/:id', async (req, res) => {
  try {
    const [books] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);

    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, data: books[0] });
  } catch (err) {
    console.error('Get book error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/books - Create new book
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('category').optional().trim(),
    body('quantity').optional().isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { title, author, isbn, category, publisher, publish_year, quantity, cover_url, description } = req.body;

      // Generate book code
      const [lastBook] = await pool.query('SELECT book_code FROM books ORDER BY id DESC LIMIT 1');
      let nextCode = 'BK-001';
      if (lastBook.length > 0) {
        const lastNum = parseInt(lastBook[0].book_code.split('-')[1]);
        nextCode = `BK-${String(lastNum + 1).padStart(3, '0')}`;
      }

      const qty = quantity || 1;

      const [result] = await pool.query(
        `INSERT INTO books (book_code, title, author, isbn, category, publisher, publish_year, quantity, available, cover_url, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
        [nextCode, title, author, isbn || null, category || 'General', publisher || null, publish_year || null, qty, qty, cover_url || null, description || null]
      );

      const [newBook] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);

      res.status(201).json({ success: true, data: newBook[0] });
    } catch (err) {
      console.error('Create book error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// PUT /api/books/:id - Update book
router.put('/:id', async (req, res) => {
  try {
    const { title, author, isbn, category, publisher, publish_year, quantity, cover_url, description, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const book = existing[0];
    const borrowedCount = book.quantity - book.available;

    // If quantity changes, recalculate available
    const newQty = quantity !== undefined ? quantity : book.quantity;
    let newAvailable = newQty - borrowedCount;
    if (newAvailable < 0) newAvailable = 0;

    // Determine status
    let newStatus = status || book.status;
    if (newAvailable === 0 && newStatus === 'available') {
      newStatus = 'borrowed';
    } else if (newAvailable > 0 && newStatus === 'borrowed') {
      newStatus = 'available';
    }

    await pool.query(
      `UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, publisher = ?, publish_year = ?,
       quantity = ?, available = ?, cover_url = ?, description = ?, status = ? WHERE id = ?`,
      [
        title || book.title, author || book.author, isbn !== undefined ? isbn : book.isbn,
        category || book.category, publisher !== undefined ? publisher : book.publisher,
        publish_year !== undefined ? publish_year : book.publish_year,
        newQty, newAvailable, cover_url !== undefined ? cover_url : book.cover_url,
        description !== undefined ? description : book.description, newStatus, req.params.id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Update book error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/books/:id - Delete book
router.delete('/:id', async (req, res) => {
  try {
    // Check if book has active borrows
    const [activeBorrows] = await pool.query(
      "SELECT COUNT(*) as count FROM borrows WHERE book_id = ? AND status IN ('borrowed', 'overdue')",
      [req.params.id]
    );

    if (activeBorrows[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active borrows',
      });
    }

    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
