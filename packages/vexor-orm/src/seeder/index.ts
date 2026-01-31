/**
 * Database Seeder
 *
 * Utilities for seeding the database with test/development data.
 * Supports factories, sequences, and relationships.
 */

import type { Database } from '../database.js';

// ============================================================================
// Types
// ============================================================================

export interface Seeder {
  /** Seeder name */
  name: string;
  /** Run the seeder */
  run(db: Database): Promise<void>;
  /** Revert/cleanup the seeded data (optional) */
  revert?(db: Database): Promise<void>;
}

export interface SeederRunner {
  /** Run all seeders */
  runAll(): Promise<void>;
  /** Run specific seeders */
  run(names: string[]): Promise<void>;
  /** Revert all seeders */
  revertAll(): Promise<void>;
  /** Revert specific seeders */
  revert(names: string[]): Promise<void>;
  /** Register a seeder */
  register(seeder: Seeder): void;
  /** Get registered seeders */
  getSeeders(): Seeder[];
}

export interface Factory<T extends Record<string, unknown>> {
  /** Generate a single record */
  make(overrides?: Partial<T>): T;
  /** Generate multiple records */
  makeMany(count: number, overrides?: Partial<T>): T[];
  /** Create a single record in the database */
  create(overrides?: Partial<T>): Promise<T>;
  /** Create multiple records in the database */
  createMany(count: number, overrides?: Partial<T>): Promise<T[]>;
  /** Define a state for the factory */
  state(name: string, attributes: Partial<T> | (() => Partial<T>)): Factory<T>;
  /** Apply a state */
  withState(name: string): Factory<T>;
}

export interface FactoryDefinition<T extends Record<string, unknown>> {
  /** Table name */
  table: string;
  /** Default attributes generator */
  definition: () => T;
  /** States for variations */
  states?: Record<string, Partial<T> | (() => Partial<T>)>;
}

export interface SeederOptions {
  /** Database instance */
  db: Database;
  /** Directory for seeder files */
  directory?: string;
  /** Table to track which seeders have run */
  trackingTable?: string;
  /** Whether to track seeder runs */
  track?: boolean;
}

// ============================================================================
// Faker-like Utilities
// ============================================================================

export const fake = {
  // ==================== String Generators ====================

  uuid(): string {
    return crypto.randomUUID();
  },

  alphanumeric(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // ==================== Name Generators ====================

  firstName(): string {
    const names = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
      'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
      'Thomas', 'Sarah', 'Charles', 'Karen', 'Emma', 'Olivia', 'Ava', 'Isabella',
      'Sophia', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Liam', 'Noah',
      'Oliver', 'Elijah', 'Lucas', 'Mason', 'Logan', 'Alexander', 'Ethan', 'Jacob',
    ];
    return names[Math.floor(Math.random() * names.length)];
  },

  lastName(): string {
    const names = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
      'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
      'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    ];
    return names[Math.floor(Math.random() * names.length)];
  },

  fullName(): string {
    return `${this.firstName()} ${this.lastName()}`;
  },

  // ==================== Internet Generators ====================

  email(firstName?: string, lastName?: string): string {
    const fn = (firstName || this.firstName()).toLowerCase();
    const ln = (lastName || this.lastName()).toLowerCase();
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const separator = Math.random() > 0.5 ? '.' : '';
    const num = Math.random() > 0.5 ? Math.floor(Math.random() * 100) : '';
    return `${fn}${separator}${ln}${num}@${domain}`;
  },

  username(): string {
    return `${this.firstName().toLowerCase()}${Math.floor(Math.random() * 1000)}`;
  },

  password(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  url(): string {
    const protocols = ['https'];
    const domains = ['example.com', 'test.com', 'sample.org', 'demo.net'];
    const paths = ['', '/about', '/contact', '/products', '/services', '/blog'];
    return `${protocols[0]}://${domains[Math.floor(Math.random() * domains.length)]}${paths[Math.floor(Math.random() * paths.length)]}`;
  },

  avatar(): string {
    const id = Math.floor(Math.random() * 70);
    return `https://i.pravatar.cc/150?img=${id}`;
  },

  // ==================== Number Generators ====================

  int(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  float(min: number = 0, max: number = 100, decimals: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  },

  price(min: number = 1, max: number = 1000): number {
    return this.float(min, max, 2);
  },

  // ==================== Date Generators ====================

  date(start?: Date, end?: Date): Date {
    const startDate = start || new Date(2020, 0, 1);
    const endDate = end || new Date();
    return new Date(
      startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    );
  },

  pastDate(years: number = 1): Date {
    const now = new Date();
    const past = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
    return this.date(past, now);
  },

  futureDate(years: number = 1): Date {
    const now = new Date();
    const future = new Date(now.getFullYear() + years, now.getMonth(), now.getDate());
    return this.date(now, future);
  },

  recentDate(days: number = 7): Date {
    const now = new Date();
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return this.date(past, now);
  },

  // ==================== Boolean Generator ====================

  boolean(probability: number = 0.5): boolean {
    return Math.random() < probability;
  },

  // ==================== Array Helpers ====================

  arrayElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  },

  arrayElements<T>(array: T[], count?: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count || Math.floor(Math.random() * array.length) + 1);
  },

  // ==================== Lorem Ipsum ====================

  word(): string {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    ];
    return words[Math.floor(Math.random() * words.length)];
  },

  words(count: number = 3): string {
    return Array.from({ length: count }, () => this.word()).join(' ');
  },

  sentence(wordCount: number = 10): string {
    const sentence = this.words(wordCount);
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  },

  paragraph(sentenceCount: number = 4): string {
    return Array.from({ length: sentenceCount }, () => this.sentence()).join(' ');
  },

  // ==================== Address ====================

  streetAddress(): string {
    const streets = ['Main St', 'Oak Ave', 'Park Rd', 'Cedar Ln', 'Maple Dr', 'Pine Way'];
    return `${this.int(100, 9999)} ${this.arrayElement(streets)}`;
  },

  city(): string {
    const cities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
      'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
      'Fort Worth', 'Columbus', 'Charlotte', 'Seattle', 'Denver', 'Boston',
    ];
    return this.arrayElement(cities);
  },

  state(): string {
    const states = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'];
    return this.arrayElement(states);
  },

  zipCode(): string {
    return String(this.int(10000, 99999));
  },

  country(): string {
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia'];
    return this.arrayElement(countries);
  },

  // ==================== Company ====================

  companyName(): string {
    const prefixes = ['Global', 'United', 'National', 'First', 'Pacific', 'Atlantic'];
    const suffixes = ['Industries', 'Solutions', 'Technologies', 'Systems', 'Corp', 'Inc'];
    return `${this.arrayElement(prefixes)} ${this.lastName()} ${this.arrayElement(suffixes)}`;
  },

  jobTitle(): string {
    const titles = [
      'Software Engineer', 'Product Manager', 'Designer', 'Data Analyst',
      'Marketing Manager', 'Sales Representative', 'Customer Support',
      'Operations Manager', 'HR Specialist', 'Financial Analyst',
    ];
    return this.arrayElement(titles);
  },

  // ==================== Phone ====================

  phoneNumber(): string {
    return `+1${this.int(200, 999)}${this.int(100, 999)}${this.int(1000, 9999)}`;
  },
};

// ============================================================================
// Sequence Generator
// ============================================================================

export class Sequence {
  private _current: number;

  constructor(start: number = 1) {
    this._current = start;
  }

  next(): number {
    return this._current++;
  }

  reset(value: number = 1): void {
    this._current = value;
  }

  current(): number {
    return this._current;
  }
}

// ============================================================================
// Factory Implementation
// ============================================================================

export function createFactory<T extends Record<string, unknown>>(
  db: Database,
  definition: FactoryDefinition<T>
): Factory<T> {
  const states: Record<string, Partial<T> | (() => Partial<T>)> = {
    ...definition.states,
  };
  let activeStates: string[] = [];

  const factory: Factory<T> = {
    make(overrides?: Partial<T>): T {
      // Start with base definition
      let attributes = definition.definition();

      // Apply active states
      for (const stateName of activeStates) {
        const stateAttrs = states[stateName];
        if (stateAttrs) {
          const attrs = typeof stateAttrs === 'function' ? stateAttrs() : stateAttrs;
          attributes = { ...attributes, ...attrs };
        }
      }

      // Apply overrides
      if (overrides) {
        attributes = { ...attributes, ...overrides };
      }

      return attributes;
    },

    makeMany(count: number, overrides?: Partial<T>): T[] {
      return Array.from({ length: count }, () => this.make(overrides));
    },

    async create(overrides?: Partial<T>): Promise<T> {
      const record = this.make(overrides);

      // Build column names and values
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const sql = `INSERT INTO ${definition.table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await db.query<T>(sql, values);

      return result.rows[0];
    },

    async createMany(count: number, overrides?: Partial<T>): Promise<T[]> {
      const records: T[] = [];
      for (let i = 0; i < count; i++) {
        const record = await this.create(overrides);
        records.push(record);
      }
      return records;
    },

    state(name: string, attributes: Partial<T> | (() => Partial<T>)): Factory<T> {
      states[name] = attributes;
      return factory;
    },

    withState(name: string): Factory<T> {
      // Create a new factory with this state active
      const newFactory = createFactory(db, definition);
      (newFactory as any).activeStates = [...activeStates, name];
      return newFactory;
    },
  };

  return factory;
}

// ============================================================================
// Seeder Runner Implementation
// ============================================================================

export function createSeederRunner(options: SeederOptions): SeederRunner {
  const seeders: Seeder[] = [];
  const { db, track = false, trackingTable = '_seeders' } = options;

  // Initialize tracking table if needed
  async function initTracking(): Promise<void> {
    if (!track) return;

    await db.query(`
      CREATE TABLE IF NOT EXISTS ${trackingTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        ran_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async function hasRun(name: string): Promise<boolean> {
    if (!track) return false;

    const result = await db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${trackingTable} WHERE name = ?`,
      [name]
    );
    return result.rows[0].count > 0;
  }

  async function markAsRun(name: string): Promise<void> {
    if (!track) return;

    await db.query(
      `INSERT INTO ${trackingTable} (name) VALUES (?)`,
      [name]
    );
  }

  async function markAsReverted(name: string): Promise<void> {
    if (!track) return;

    await db.query(
      `DELETE FROM ${trackingTable} WHERE name = ?`,
      [name]
    );
  }

  return {
    async runAll(): Promise<void> {
      await initTracking();

      for (const seeder of seeders) {
        if (track && await hasRun(seeder.name)) {
          console.log(`Skipping seeder: ${seeder.name} (already run)`);
          continue;
        }

        console.log(`Running seeder: ${seeder.name}`);
        await seeder.run(db);
        await markAsRun(seeder.name);
        console.log(`Completed seeder: ${seeder.name}`);
      }
    },

    async run(names: string[]): Promise<void> {
      await initTracking();

      for (const name of names) {
        const seeder = seeders.find((s) => s.name === name);
        if (!seeder) {
          console.warn(`Seeder not found: ${name}`);
          continue;
        }

        if (track && await hasRun(seeder.name)) {
          console.log(`Skipping seeder: ${seeder.name} (already run)`);
          continue;
        }

        console.log(`Running seeder: ${seeder.name}`);
        await seeder.run(db);
        await markAsRun(seeder.name);
        console.log(`Completed seeder: ${seeder.name}`);
      }
    },

    async revertAll(): Promise<void> {
      // Revert in reverse order
      for (let i = seeders.length - 1; i >= 0; i--) {
        const seeder = seeders[i];
        if (seeder.revert) {
          console.log(`Reverting seeder: ${seeder.name}`);
          await seeder.revert(db);
          await markAsReverted(seeder.name);
          console.log(`Reverted seeder: ${seeder.name}`);
        }
      }
    },

    async revert(names: string[]): Promise<void> {
      for (const name of names.reverse()) {
        const seeder = seeders.find((s) => s.name === name);
        if (!seeder || !seeder.revert) {
          continue;
        }

        console.log(`Reverting seeder: ${seeder.name}`);
        await seeder.revert(db);
        await markAsReverted(seeder.name);
        console.log(`Reverted seeder: ${seeder.name}`);
      }
    },

    register(seeder: Seeder): void {
      seeders.push(seeder);
    },

    getSeeders(): Seeder[] {
      return [...seeders];
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a simple seeder
 */
export function defineSeeder(
  name: string,
  run: (db: Database) => Promise<void>,
  revert?: (db: Database) => Promise<void>
): Seeder {
  return { name, run, revert };
}

/**
 * Truncate table(s)
 */
export async function truncate(db: Database, tables: string | string[]): Promise<void> {
  const tableList = Array.isArray(tables) ? tables : [tables];
  for (const table of tableList) {
    await db.query(`DELETE FROM ${table}`);
    // Reset auto-increment if supported
    try {
      await db.query(`DELETE FROM sqlite_sequence WHERE name = ?`, [table]);
    } catch {
      // Ignore if not SQLite
    }
  }
}
