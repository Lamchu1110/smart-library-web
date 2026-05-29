const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/readers - List all readers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, membership, status, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (r.name LIKE ? OR r.student_code LIKE ? OR r.reader_code LIKE ? OR r.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (membership) {
      whereClause += ' AND r.membership_type = ?';
      params.push(membership);
    }

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    const allowedSorts = ['name', 'created_at', 'student_code', 'status'];
    const sortColumn = allowedSorts.includes(sort) ? `r.${sort}` : 'r.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM readers r WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [readers] = await pool.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM borrows b WHERE b.reader_id = r.id AND b.status IN ('borrowed', 'overdue')) as active_borrows
       FROM readers r
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: readers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get readers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/readers/:id - Get single reader with borrow history
router.get('/:id', async (req, res) => {
  try {
    const [readers] = await pool.query('SELECT * FROM readers WHERE id = ?', [req.params.id]);

    if (readers.length === 0) {
      return res.status(404).json({ success: false, message: 'Reader not found' });
    }

    // Get borrow stats
    const [stats] = await pool.query(
      `SELECT
        COUNT(*) as total_borrows,
        SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as active_borrows,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count,
        SUM(penalty) as total_penalty
       FROM borrows WHERE reader_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...readers[0], borrow_stats: stats[0] },
    });
  } catch (err) {
    console.error('Get reader error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/readers - Create reader
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, phone, student_code, membership_type, address } = req.body;

      // Check duplicate email
      const [existing] = await pool.query('SELECT id FROM readers WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      // Generate reader code
      const [lastReader] = await pool.query('SELECT reader_code FROM readers ORDER BY id DESC LIMIT 1');
      let nextCode = 'R-10001';
      if (lastReader.length > 0) {
        const lastNum = parseInt(lastReader[0].reader_code.split('-')[1]);
        nextCode = `R-${lastNum + 1}`;
      }

      const [result] = await pool.query(
        `INSERT INTO readers (reader_code, name, email, phone, student_code, membership_type, address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nextCode, name, email, phone || null, student_code || null, membership_type || 'undergraduate', address || null]
      );

      const [newReader] = await pool.query('SELECT * FROM readers WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: newReader[0] });
    } catch (err) {
      console.error('Create reader error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// PUT /api/readers/:id - Update reader
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, student_code, membership_type, address, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM readers WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Reader not found' });
    }

    const reader = existing[0];

    // Check email uniqueness if changed
    if (email && email !== reader.email) {
      const [emailCheck] = await pool.query('SELECT id FROM readers WHERE email = ? AND id != ?', [email, req.params.id]);
      if (emailCheck.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
    }

    await pool.query(
      `UPDATE readers SET name = ?, email = ?, phone = ?, student_code = ?, membership_type = ?, address = ?, status = ?
       WHERE id = ?`,
      [
        name || reader.name, email || reader.email, phone !== undefined ? phone : reader.phone,
        student_code !== undefined ? student_code : reader.student_code,
        membership_type || reader.membership_type, address !== undefined ? address : reader.address,
        status || reader.status, req.params.id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM readers WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Update reader error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/readers/:id
router.delete('/:id', async (req, res) => {
  try {
    const [activeBorrows] = await pool.query(
      "SELECT COUNT(*) as count FROM borrows WHERE reader_id = ? AND status IN ('borrowed', 'overdue')",
      [req.params.id]
    );

    if (activeBorrows[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete reader with active borrows',
      });
    }

    const [result] = await pool.query('DELETE FROM readers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Reader not found' });
    }

    res.json({ success: true, message: 'Reader deleted successfully' });
  } catch (err) {
    console.error('Delete reader error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
