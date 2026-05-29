const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/borrows - List all borrow transactions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sort = 'b.created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND b.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (r.name LIKE ? OR bk.title LIKE ? OR b.borrow_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM borrows b
       JOIN readers r ON b.reader_id = r.id
       JOIN books bk ON b.book_id = bk.id
       WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [borrows] = await pool.query(
      `SELECT b.*, r.name as reader_name, r.reader_code, r.email as reader_email,
              bk.title as book_title, bk.book_code, bk.isbn as book_isbn, bk.author as book_author
       FROM borrows b
       JOIN readers r ON b.reader_id = r.id
       JOIN books bk ON b.book_id = bk.id
       WHERE ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: borrows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get borrows error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/borrows/overdue - Get overdue borrows
router.get('/overdue', async (req, res) => {
  try {
    const [borrows] = await pool.query(
      `SELECT b.*, r.name as reader_name, r.reader_code, r.email as reader_email,
              bk.title as book_title, bk.book_code
       FROM borrows b
       JOIN readers r ON b.reader_id = r.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.status = 'overdue' OR (b.status = 'borrowed' AND b.due_date < CURDATE())
       ORDER BY b.due_date ASC`
    );

    // Auto-update status to overdue
    await pool.query(
      "UPDATE borrows SET status = 'overdue' WHERE status = 'borrowed' AND due_date < CURDATE()"
    );

    res.json({ success: true, data: borrows });
  } catch (err) {
    console.error('Get overdue error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/borrows/history/:readerId - Get borrow history for a reader
router.get('/history/:readerId', async (req, res) => {
  try {
    const [borrows] = await pool.query(
      `SELECT b.*, bk.title as book_title, bk.book_code, bk.isbn as book_isbn
       FROM borrows b
       JOIN books bk ON b.book_id = bk.id
       WHERE b.reader_id = ?
       ORDER BY b.created_at DESC`,
      [req.params.readerId]
    );

    res.json({ success: true, data: borrows });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/borrows - Issue a book (create borrow)
router.post(
  '/',
  [
    body('reader_id').isInt().withMessage('Reader ID is required'),
    body('book_id').isInt().withMessage('Book ID is required'),
    body('borrow_date').isDate().withMessage('Valid borrow date is required'),
    body('due_date').isDate().withMessage('Valid due date is required'),
  ],
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        connection.release();
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { reader_id, book_id, borrow_date, due_date, notes } = req.body;

      await connection.beginTransaction();

      // Check reader exists and is active
      const [readers] = await connection.query('SELECT * FROM readers WHERE id = ? AND status = ?', [reader_id, 'active']);
      if (readers.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Reader not found or not active' });
      }

      // Check reader borrow limit
      const [activeCount] = await connection.query(
        "SELECT COUNT(*) as count FROM borrows WHERE reader_id = ? AND status IN ('borrowed', 'overdue')",
        [reader_id]
      );
      if (activeCount[0].count >= readers[0].max_borrow) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: `Reader has reached max borrow limit (${readers[0].max_borrow})` });
      }

      // Check book availability
      const [books] = await connection.query('SELECT * FROM books WHERE id = ? FOR UPDATE', [book_id]);
      if (books.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Book not found' });
      }
      if (books[0].available <= 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Book is not available for borrowing' });
      }

      // Generate borrow code
      const [lastBorrow] = await connection.query('SELECT borrow_code FROM borrows ORDER BY id DESC LIMIT 1');
      let nextCode = 'TRX-0001';
      if (lastBorrow.length > 0) {
        const lastNum = parseInt(lastBorrow[0].borrow_code.split('-')[1]);
        nextCode = `TRX-${String(lastNum + 1).padStart(4, '0')}`;
      }

      // Create borrow record
      const [result] = await connection.query(
        `INSERT INTO borrows (borrow_code, reader_id, book_id, borrow_date, due_date, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, 'borrowed')`,
        [nextCode, reader_id, book_id, borrow_date, due_date, notes || null]
      );

      // Decrement book availability
      await connection.query(
        'UPDATE books SET available = available - 1, status = IF(available - 1 <= 0, "borrowed", status) WHERE id = ?',
        [book_id]
      );

      await connection.commit();

      const [newBorrow] = await pool.query(
        `SELECT b.*, r.name as reader_name, bk.title as book_title
         FROM borrows b
         JOIN readers r ON b.reader_id = r.id
         JOIN books bk ON b.book_id = bk.id
         WHERE b.id = ?`,
        [result.insertId]
      );

      connection.release();
      res.status(201).json({ success: true, data: newBorrow[0] });
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error('Create borrow error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// PUT /api/borrows/:id/return - Return a book
router.put('/:id/return', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [borrows] = await connection.query(
      "SELECT * FROM borrows WHERE id = ? AND status IN ('borrowed', 'overdue')",
      [req.params.id]
    );

    if (borrows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Borrow not found or already returned' });
    }

    const borrow = borrows[0];
    const returnDate = new Date().toISOString().split('T')[0];

    // Calculate penalty ($1 per day overdue)
    let penalty = 0;
    const dueDate = new Date(borrow.due_date);
    const today = new Date();
    if (today > dueDate) {
      const daysLate = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      penalty = daysLate * 1.0;
    }

    // Update borrow
    await connection.query(
      "UPDATE borrows SET status = 'returned', return_date = ?, penalty = ? WHERE id = ?",
      [returnDate, penalty, req.params.id]
    );

    // Increment book availability
    await connection.query(
      'UPDATE books SET available = available + 1, status = IF(available + 1 > 0, "available", status) WHERE id = ?',
      [borrow.book_id]
    );

    await connection.commit();

    const [updated] = await pool.query(
      `SELECT b.*, r.name as reader_name, bk.title as book_title
       FROM borrows b
       JOIN readers r ON b.reader_id = r.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    connection.release();
    res.json({ success: true, data: updated[0], message: penalty > 0 ? `Late return penalty: $${penalty.toFixed(2)}` : 'Book returned successfully' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Return book error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/borrows/:id/extend - Extend due date
router.put('/:id/extend', async (req, res) => {
  try {
    const { newDueDate } = req.body;

    if (!newDueDate) {
      return res.status(400).json({ success: false, message: 'New due date is required' });
    }

    const [borrows] = await pool.query(
      "SELECT * FROM borrows WHERE id = ? AND status IN ('borrowed', 'overdue')",
      [req.params.id]
    );

    if (borrows.length === 0) {
      return res.status(400).json({ success: false, message: 'Borrow not found or already returned' });
    }

    const newDate = new Date(newDueDate);
    const currentDue = new Date(borrows[0].due_date);

    if (newDate <= currentDue) {
      return res.status(400).json({ success: false, message: 'New due date must be after current due date' });
    }

    await pool.query(
      "UPDATE borrows SET due_date = ?, status = 'borrowed' WHERE id = ?",
      [newDueDate, req.params.id]
    );

    const [updated] = await pool.query(
      `SELECT b.*, r.name as reader_name, bk.title as book_title
       FROM borrows b
       JOIN readers r ON b.reader_id = r.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Extend error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
