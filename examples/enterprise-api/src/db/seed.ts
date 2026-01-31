/**
 * Database Seed Script
 *
 * Populates the database with sample data for testing.
 */

import { db, initializeDatabase } from './index.js';
import { hashPassword } from '../utils/password.js';

async function seed(): Promise<void> {
  console.log('Starting database seed...');

  await initializeDatabase();

  // Create admin user
  const adminPassword = await hashPassword('Admin123!');
  await db.query(`
    INSERT OR IGNORE INTO users (email, password, name, role)
    VALUES (?, ?, ?, ?)
  `, ['admin@example.com', adminPassword, 'Admin User', 'admin']);

  // Create regular users
  const userPassword = await hashPassword('User1234!');
  const users = [
    ['john@example.com', userPassword, 'John Doe', 'user'],
    ['jane@example.com', userPassword, 'Jane Smith', 'user'],
    ['bob@example.com', userPassword, 'Bob Wilson', 'user'],
  ];

  for (const [email, password, name, role] of users) {
    await db.query(`
      INSERT OR IGNORE INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `, [email, password, name, role]);
  }

  // Create sample products
  const products = [
    ['Laptop Pro 15"', 'High-performance laptop with 16GB RAM', 1299.99, 50, 'Electronics'],
    ['Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 49.99, 200, 'Electronics'],
    ['Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX switches', 149.99, 100, 'Electronics'],
    ['USB-C Hub', '7-in-1 USB-C hub with HDMI and card reader', 79.99, 150, 'Electronics'],
    ['Monitor Stand', 'Adjustable monitor stand with storage', 59.99, 75, 'Accessories'],
    ['Desk Lamp', 'LED desk lamp with adjustable brightness', 39.99, 120, 'Accessories'],
    ['Webcam HD', '1080p webcam with built-in microphone', 89.99, 80, 'Electronics'],
    ['Headphones', 'Noise-canceling wireless headphones', 299.99, 60, 'Audio'],
    ['Speaker Set', 'Bluetooth speaker with 360-degree sound', 129.99, 45, 'Audio'],
    ['Phone Charger', 'Fast charging USB-C charger 65W', 34.99, 300, 'Accessories'],
  ];

  for (const [name, description, price, stock, category] of products) {
    await db.query(`
      INSERT OR IGNORE INTO products (name, description, price, stock, category, created_by)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [name, description, price, stock, category]);
  }

  console.log('Database seeded successfully!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@example.com / Admin123!');
  console.log('  User:  john@example.com / User1234!');
  console.log('');

  await db.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
