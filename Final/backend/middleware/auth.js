const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret_key';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student role required.' });
  }
  next();
};

module.exports = { auth, isAdmin, isStudent, SECRET_KEY };
