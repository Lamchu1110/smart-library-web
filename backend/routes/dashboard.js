const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/dashboard/stats - Dashboard summary statistics
router.get('/stats', async (req, res) => {
  try {
    const [bookStats] = await pool.query(`
      SELECT
        COUNT(*) as total_books,
        SUM(quantity) as total_copies,
        SUM(available) as available_copies,
        SUM(quantity - available) as borrowed_copies
      FROM books
    `);

    const [overdueCount] = await pool.query(`
      SELECT COUNT(*) as count FROM borrows
      WHERE status = 'overdue' OR (status = 'borrowed' AND due_date < CURDATE())
    `);

    const [readerCount] = await pool.query('SELECT COUNT(*) as count FROM readers');

    const [categoryStats] = await pool.query(`
      SELECT category, COUNT(*) as count, SUM(quantity) as total_copies
      FROM books
      GROUP BY category
      ORDER BY total_copies DESC
    `);

    res.json({
      success: true,
      data: {
        totalBooks: bookStats[0].total_copies || 0,
        availableBooks: bookStats[0].available_copies || 0,
        borrowedBooks: bookStats[0].borrowed_copies || 0,
        overdueBooks: overdueCount[0].count || 0,
        totalReaders: readerCount[0].count || 0,
        categories: categoryStats,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dashboard/recent - Recent borrowing activity
router.get('/recent', async (req, res) => {
  try {
    const [recent] = await pool.query(`
      SELECT b.*, r.name as reader_name, r.reader_code,
             bk.title as book_title, bk.book_code
      FROM borrows b
      JOIN readers r ON b.reader_id = r.id
      JOIN books bk ON b.book_id = bk.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    res.json({ success: true, data: recent });
  } catch (err) {
    console.error('Recent activity error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dashboard/trends - Monthly borrowing/returning trends
router.get('/trends', async (req, res) => {
  try {
    const [trends] = await pool.query(`
      SELECT
        DATE_FORMAT(borrow_date, '%Y-%m') as month,
        DATE_FORMAT(borrow_date, '%b') as month_label,
        COUNT(*) as borrowed,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned
      FROM borrows
      WHERE borrow_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(borrow_date, '%Y-%m'), DATE_FORMAT(borrow_date, '%b')
      ORDER BY month ASC
    `);

    res.json({ success: true, data: trends });
  } catch (err) {
    console.error('Trends error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
