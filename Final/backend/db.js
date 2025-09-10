const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
    isVerified INTEGER DEFAULT 0,
    verificationToken TEXT,
    resetPasswordToken TEXT,
    resetPasswordExpires INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Students table
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    course TEXT NOT NULL,
    enrollmentDate TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_students_userid ON students(userId)');
});

module.exports = db;
