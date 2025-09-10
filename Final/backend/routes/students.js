const express = require('express');
const db = require('../db');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all students (Admin only)
router.get('/', auth, isAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all(
    'SELECT * FROM students ORDER BY createdAt DESC LIMIT ? OFFSET ?',
    [limit, offset],
    (err, students) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      
      db.get('SELECT COUNT(*) as total FROM students', (err, count) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        
        res.json({
          students,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(count.total / limit),
            totalStudents: count.total
          }
        });
      });
    }
  );
});

// Get own student profile (for students)
router.get('/profile', auth, (req, res) => {
  db.get(
    'SELECT name, email, course, enrollmentDate FROM students WHERE userId = ?', 
    [req.user.id], 
    (err, student) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });
      res.json(student); // Only essential data
    }
  );
});

// Get specific student profile by ID (Admin only)
router.get('/profile/:id', auth, isAdmin, (req, res) => {
  const studentId = req.params.id;
  db.get('SELECT * FROM students WHERE id = ?', [studentId], (err, student) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    res.json(student);
  });
});

// Add new student (Admin only)
router.post('/', auth, isAdmin, (req, res) => {
  const { name, email, course, enrollmentDate } = req.body;
  
  db.run(
    'INSERT INTO students (userId, name, email, course, enrollmentDate) VALUES (?, ?, ?, ?, ?)',
    [0, name, email, course, enrollmentDate], // userId = 0 for admin-created students
    function(err) {
      if (err) return res.status(500).json({ message: 'Failed to create student' });
      res.status(201).json({ id: this.lastID, message: 'Student created successfully' });
    }
  );
});

// Update own profile (Students) or any profile (Admin)
router.put('/profile', auth, (req, res) => {
  const { name, email, course } = req.body;
  
  db.run(
    'UPDATE students SET name = ?, email = ?, course = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?',
    [name, email, course, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ message: 'Failed to update profile' });
      if (this.changes === 0) return res.status(404).json({ message: 'Profile not found' });
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Update specific student (Admin only)
router.put('/:id', auth, isAdmin, (req, res) => {
  const { name, email, course } = req.body;
  const studentId = req.params.id;
  
  db.run(
    'UPDATE students SET name = ?, email = ?, course = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [name, email, course, studentId],
    function(err) {
      if (err) return res.status(500).json({ message: 'Failed to update student' });
      if (this.changes === 0) return res.status(404).json({ message: 'Student not found' });
      res.json({ message: 'Student updated successfully' });
    }
  );
});

// Delete student (Admin only)
router.delete('/:id', auth, isAdmin, (req, res) => {
  const studentId = req.params.id;
  
  db.run('DELETE FROM students WHERE id = ?', [studentId], function(err) {
    if (err) return res.status(500).json({ message: 'Failed to delete student' });
    if (this.changes === 0) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  });
});

module.exports = router;
