const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { auth, SECRET_KEY } = require('../middleware/auth');

const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    db.get('SELECT email FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Insert user
      db.run(
        'INSERT INTO users (name, email, password, role, verificationToken) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role || 'student', verificationToken],
        function(err) {
          if (err) return res.status(500).json({ message: 'Registration failed' });
          
          // If user is a student, create student profile
          if (role === 'student' || !role) {
            const enrollmentDate = new Date().toISOString().split('T');
            db.run(
              'INSERT INTO students (userId, name, email, course, enrollmentDate) VALUES (?, ?, ?, ?, ?)',
              [this.lastID, name, email, 'MERN Bootcamp', enrollmentDate],
              (err) => {
                if (err) console.error('Error creating student profile:', err);
              }
            );
          }

          res.status(201).json({ 
            message: 'User registered successfully',
            userId: this.lastID 
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

// Get current user
router.get('/me', auth, (req, res) => {
  db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedNewPassword, req.user.id],
        (err) => {
          if (err) return res.status(500).json({ message: 'Failed to update password' });
          res.json({ message: 'Password updated successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
