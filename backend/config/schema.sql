-- Smart Library Management System
-- Database Schema

CREATE DATABASE IF NOT EXISTS smart_library
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_library;

-- ============================================
-- Users (for authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'librarian', 'staff') DEFAULT 'librarian',
  avatar_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Books
-- ============================================
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(200) NOT NULL,
  isbn VARCHAR(20) DEFAULT NULL,
  category VARCHAR(100) DEFAULT 'General',
  publisher VARCHAR(200) DEFAULT NULL,
  publish_year INT DEFAULT NULL,
  quantity INT DEFAULT 1,
  available INT DEFAULT 1,
  cover_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  status ENUM('available', 'borrowed', 'lost') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status),
  FULLTEXT INDEX idx_search (title, author)
);

-- ============================================
-- Readers
-- ============================================
CREATE TABLE IF NOT EXISTS readers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reader_code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) DEFAULT NULL,
  student_code VARCHAR(30) DEFAULT NULL,
  membership_type ENUM('undergraduate', 'postgraduate', 'faculty', 'staff') DEFAULT 'undergraduate',
  address TEXT DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  max_borrow INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_student_code (student_code)
);

-- ============================================
-- Borrows / Transactions
-- ============================================
CREATE TABLE IF NOT EXISTS borrows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  borrow_code VARCHAR(20) NOT NULL UNIQUE,
  reader_id INT NOT NULL,
  book_id INT NOT NULL,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE DEFAULT NULL,
  status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
  penalty DECIMAL(10, 2) DEFAULT 0.00,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE RESTRICT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_reader (reader_id),
  INDEX idx_book (book_id),
  INDEX idx_due_date (due_date)
);

-- ============================================
-- Seed data: Default admin user (password: admin123)
-- ============================================
INSERT INTO users (name, email, password, role) VALUES
('Admin Profile', 'admin@university.edu', '$2a$10$0647ngX0qHVBGOkduh9Zj.zZsIWlwI5X.RkXKfiNhYd8UPWtLQ4LO', 'admin')
ON DUPLICATE KEY UPDATE name = name;

-- ============================================
-- Seed data: Sample Books
-- ============================================
INSERT INTO books (book_code, title, author, isbn, category, publisher, publish_year, quantity, available, status) VALUES
('BK-001', 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'Computer Science', 'MIT Press', 2009, 5, 3, 'available'),
('BK-002', 'The Feynman Lectures', 'Richard P. Feynman', '978-0465023820', 'Physics', 'Basic Books', 2011, 2, 0, 'borrowed'),
('BK-003', 'Advanced Calculus', 'Patrick M. Fitzpatrick', '978-0821847916', 'Mathematics', 'AMS', 2009, 8, 6, 'available'),
('BK-004', 'Clean Code', 'Robert C. Martin', '978-0132350884', 'Computer Science', 'Prentice Hall', 2008, 4, 2, 'available'),
('BK-005', 'Design Patterns', 'Erich Gamma', '978-0201633610', 'Computer Science', 'Addison-Wesley', 1994, 3, 1, 'available'),
('BK-006', 'The Pragmatic Programmer', 'David Thomas', '978-0135957059', 'Computer Science', 'Addison-Wesley', 2019, 2, 0, 'borrowed'),
('BK-007', 'Sapiens: A Brief History', 'Yuval Noah Harari', '978-0062316097', 'History', 'Harper', 2015, 5, 4, 'available'),
('BK-008', 'To Kill a Mockingbird', 'Harper Lee', '978-0060935467', 'Literature', 'Harper Perennial', 1960, 6, 5, 'available')
ON DUPLICATE KEY UPDATE title = title;

-- ============================================
-- Seed data: Sample Readers
-- ============================================
INSERT INTO readers (reader_code, name, email, phone, student_code, membership_type, status) VALUES
('R-10429', 'Emma Thompson', 'ethompson@uni.edu', '+84901234567', 'U-230914', 'undergraduate', 'active'),
('R-10430', 'Marcus Johnson', 'mjohnson@uni.edu', '+84901234568', 'U-230915', 'undergraduate', 'suspended'),
('R-10431', 'David Chen', 'dchen@uni.edu', '+84901234569', 'P-184022', 'postgraduate', 'active'),
('R-10432', 'Sarah Adams', 'sadams@uni.edu', '+84901234570', 'F-009182', 'faculty', 'inactive'),
('R-10433', 'James Wilson', 'jwilson@uni.edu', '+84901234571', 'U-230920', 'undergraduate', 'active'),
('R-10434', 'Linda Park', 'lpark@uni.edu', '+84901234572', 'P-184030', 'postgraduate', 'active')
ON DUPLICATE KEY UPDATE name = name;

-- ============================================
-- Seed data: Sample Borrows
-- ============================================
INSERT INTO borrows (borrow_code, reader_id, book_id, borrow_date, due_date, return_date, status, penalty) VALUES
('TRX-8902', 1, 6, '2023-10-12', '2023-10-26', NULL, 'overdue', 15.00),
('TRX-8905', 2, 5, '2023-11-01', '2023-11-15', NULL, 'borrowed', 0.00),
('TRX-8890', 3, 4, '2023-10-05', '2023-10-19', '2023-10-18', 'returned', 0.00),
('TRX-8875', 4, 1, '2023-09-28', '2023-10-12', NULL, 'overdue', 45.50),
('TRX-8870', 5, 3, '2023-10-10', '2023-10-24', NULL, 'borrowed', 0.00),
('TRX-8860', 6, 7, '2023-09-20', '2023-10-04', '2023-10-03', 'returned', 0.00)
ON DUPLICATE KEY UPDATE borrow_code = borrow_code;
