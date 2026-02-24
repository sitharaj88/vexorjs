/**
 * Migration Generator
 *
 * Generates SQL migrations from table definitions with support for
 * schema diffing, index creation, and constraint management.
 */

import type { TableDef, ColumnDef, IndexDef, ConstraintDef, DataType } from '../core/types.js';

/**
 * Generator options
 */
export interface GeneratorOptions {
  /** Database dialect */
  dialect: 'postgres' | 'sqlite' | 'mysql';
  /** Add IF NOT EXISTS to CREATE statements */
  ifNotExists?: boolean;
  /** Add IF EXISTS to DROP statements */
  ifExists?: boolean;
}

/**
 * Generated migration
 */
export interface GeneratedMigration {
  /** Version/timestamp */
  version: string;
  /** Migration name */
  name: string;
  /** Up SQL statements */
  up: string[];
  /** Down SQL statements */
  down: string[];
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: GeneratorOptions = {
  dialect: 'postgres',
  ifNotExists: true,
  ifExists: true,
};

/**
 * Migration Generator
 *
 * Generates SQL migration statements from table definitions.
 */
export class MigrationGenerator {
  private options: GeneratorOptions;

  constructor(options: Partial<GeneratorOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate migration for creating a table
   */
  createTable(table: TableDef): GeneratedMigration {
    const version = this.generateVersion();
    const name = `create_${table.tableName}`;

    const up = [this.generateCreateTableSQL(table)];
    const down = [this.generateDropTableSQL(table.tableName)];

    // Add index creation
    if (table.indexes) {
      for (const index of table.indexes) {
        up.push(this.generateCreateIndexSQL(table.tableName, index));
        down.unshift(this.generateDropIndexSQL(index.name));
      }
    }

    return { version, name, up, down };
  }

  /**
   * Generate migration for dropping a table
   */
  dropTable(tableName: string): GeneratedMigration {
    const version = this.generateVersion();
    const name = `drop_${tableName}`;

    return {
      version,
      name,
      up: [this.generateDropTableSQL(tableName)],
      down: [],  // Can't automatically restore dropped table
    };
  }

  /**
   * Generate migration for adding a column
   */
  addColumn(
    tableName: string,
    columnName: string,
    column: ColumnDef
  ): GeneratedMigration {
    const version = this.generateVersion();
    const name = `add_${columnName}_to_${tableName}`;

    return {
      version,
      name,
      up: [this.generateAddColumnSQL(tableName, columnName, column)],
      down: [this.generateDropColumnSQL(tableName, columnName)],
    };
  }

  /**
   * Generate migration for dropping a column
   */
  dropColumn(tableName: string, columnName: string): GeneratedMigration {
    const version = this.generateVersion();
    const name = `drop_${columnName}_from_${tableName}`;

    return {
      version,
      name,
      up: [this.generateDropColumnSQL(tableName, columnName)],
      down: [],  // Can't automatically restore dropped column
    };
  }

  /**
   * Generate migration for altering a column
   */
  alterColumn(
    tableName: string,
    columnName: string,
    changes: Partial<ColumnDef>
  ): GeneratedMigration {
    const version = this.generateVersion();
    const name = `alter_${columnName}_in_${tableName}`;

    return {
      version,
      name,
      up: this.generateAlterColumnSQL(tableName, columnName, changes),
      down: [],  // Would need previous state to generate rollback
    };
  }

  /**
   * Generate migration for adding an index
   */
  addIndex(tableName: string, index: IndexDef): GeneratedMigration {
    const version = this.generateVersion();
    const name = `add_index_${index.name}`;

    return {
      version,
      name,
      up: [this.generateCreateIndexSQL(tableName, index)],
      down: [this.generateDropIndexSQL(index.name)],
    };
  }

  /**
   * Generate migration for dropping an index
   */
  dropIndex(indexName: string): GeneratedMigration {
    const version = this.generateVersion();
    const name = `drop_index_${indexName}`;

    return {
      version,
      name,
      up: [this.generateDropIndexSQL(indexName)],
      down: [],
    };
  }

  /**
   * Generate migration for renaming a table
   */
  renameTable(oldName: string, newName: string): GeneratedMigration {
    const version = this.generateVersion();
    const name = `rename_${oldName}_to_${newName}`;

    return {
      version,
      name,
      up: [`ALTER TABLE ${this.quote(oldName)} RENAME TO ${this.quote(newName)}`],
      down: [`ALTER TABLE ${this.quote(newName)} RENAME TO ${this.quote(oldName)}`],
    };
  }

  /**
   * Generate migration for renaming a column
   */
  renameColumn(
    tableName: string,
    oldName: string,
    newName: string
  ): GeneratedMigration {
    const version = this.generateVersion();
    const name = `rename_${oldName}_to_${newName}_in_${tableName}`;

    const up =
      this.options.dialect === 'mysql'
        ? `ALTER TABLE ${this.quote(tableName)} CHANGE ${this.quote(oldName)} ${this.quote(newName)}`
        : `ALTER TABLE ${this.quote(tableName)} RENAME COLUMN ${this.quote(oldName)} TO ${this.quote(newName)}`;

    const down =
      this.options.dialect === 'mysql'
        ? `ALTER TABLE ${this.quote(tableName)} CHANGE ${this.quote(newName)} ${this.quote(oldName)}`
        : `ALTER TABLE ${this.quote(tableName)} RENAME COLUMN ${this.quote(newName)} TO ${this.quote(oldName)}`;

    return {
      version,
      name,
      up: [up],
      down: [down],
    };
  }

  /**
   * Generate CREATE TABLE SQL
   */
  private generateCreateTableSQL(table: TableDef): string {
    const ifNotExists = this.options.ifNotExists ? 'IF NOT EXISTS ' : '';
    const columns: string[] = [];
    const constraints: string[] = [];

    // Generate column definitions
    for (const [name, column] of Object.entries(table.columns)) {
      columns.push(this.generateColumnDef(name, column));

      // Add primary key constraint if needed
      if (column.primaryKey) {
        constraints.push(`PRIMARY KEY (${this.quote(name)})`);
      }

      // Add foreign key constraint if needed
      if (column.references) {
        constraints.push(
          `FOREIGN KEY (${this.quote(name)}) REFERENCES ${this.quote(column.references.table)}(${this.quote(column.references.column)})`
        );
      }
    }

    // Add explicit constraints
    if (table.constraints) {
      for (const constraint of table.constraints) {
        constraints.push(this.generateConstraint(constraint));
      }
    }

    const allDefs = [...columns, ...constraints];

    return `CREATE TABLE ${ifNotExists}${this.quote(table.tableName)} (\n  ${allDefs.join(',\n  ')}\n)`;
  }

  /**
   * Generate DROP TABLE SQL
   */
  private generateDropTableSQL(tableName: string): string {
    const ifExists = this.options.ifExists ? 'IF EXISTS ' : '';
    return `DROP TABLE ${ifExists}${this.quote(tableName)}`;
  }

  /**
   * Generate column definition
   */
  private generateColumnDef(name: string, column: ColumnDef): string {
    const parts: string[] = [this.quote(name)];

    // Data type
    parts.push(this.mapDataType(column.dataType, column.length, column.precision, column.scale));

    // NOT NULL
    if (column.notNull) {
      parts.push('NOT NULL');
    }

    // DEFAULT
    if (column.defaultValue !== undefined) {
      parts.push(`DEFAULT ${this.formatDefault(column.defaultValue)}`);
    }

    // UNIQUE
    if (column.unique) {
      parts.push('UNIQUE');
    }

    return parts.join(' ');
  }

  /**
   * Generate ADD COLUMN SQL
   */
  private generateAddColumnSQL(
    tableName: string,
    columnName: string,
    column: ColumnDef
  ): string {
    const columnDef = this.generateColumnDef(columnName, column);
    return `ALTER TABLE ${this.quote(tableName)} ADD COLUMN ${columnDef}`;
  }

  /**
   * Generate DROP COLUMN SQL
   */
  private generateDropColumnSQL(tableName: string, columnName: string): string {
    return `ALTER TABLE ${this.quote(tableName)} DROP COLUMN ${this.quote(columnName)}`;
  }

  /**
   * Generate ALTER COLUMN SQL
   */
  private generateAlterColumnSQL(
    tableName: string,
    columnName: string,
    changes: Partial<ColumnDef>
  ): string[] {
    const statements: string[] = [];

    if (changes.dataType) {
      if (this.options.dialect === 'postgres') {
        statements.push(
          `ALTER TABLE ${this.quote(tableName)} ALTER COLUMN ${this.quote(columnName)} TYPE ${this.mapDataType(changes.dataType)}`
        );
      } else {
        statements.push(
          `ALTER TABLE ${this.quote(tableName)} MODIFY COLUMN ${this.quote(columnName)} ${this.mapDataType(changes.dataType)}`
        );
      }
    }

    if (changes.notNull !== undefined) {
      if (this.options.dialect === 'postgres') {
        statements.push(
          `ALTER TABLE ${this.quote(tableName)} ALTER COLUMN ${this.quote(columnName)} ${changes.notNull ? 'SET NOT NULL' : 'DROP NOT NULL'}`
        );
      }
    }

    if (changes.defaultValue !== undefined) {
      if (this.options.dialect === 'postgres') {
        statements.push(
          `ALTER TABLE ${this.quote(tableName)} ALTER COLUMN ${this.quote(columnName)} SET DEFAULT ${this.formatDefault(changes.defaultValue)}`
        );
      }
    }

    return statements;
  }

  /**
   * Generate CREATE INDEX SQL
   */
  private generateCreateIndexSQL(tableName: string, index: IndexDef): string {
    const unique = index.unique ? 'UNIQUE ' : '';
    const ifNotExists = this.options.ifNotExists ? 'IF NOT EXISTS ' : '';
    const columns = index.columns.map((c) => this.quote(c)).join(', ');

    let sql = `CREATE ${unique}INDEX ${ifNotExists}${this.quote(index.name)} ON ${this.quote(tableName)} (${columns})`;

    if (index.where && this.options.dialect === 'postgres') {
      sql += ` WHERE ${index.where}`;
    }

    return sql;
  }

  /**
   * Generate DROP INDEX SQL
   */
  private generateDropIndexSQL(indexName: string): string {
    const ifExists = this.options.ifExists ? 'IF EXISTS ' : '';
    return `DROP INDEX ${ifExists}${this.quote(indexName)}`;
  }

  /**
   * Generate constraint SQL
   */
  private generateConstraint(constraint: ConstraintDef): string {
    switch (constraint.type) {
      case 'primary':
        return `CONSTRAINT ${this.quote(constraint.name)} PRIMARY KEY (${constraint.columns.map((c) => this.quote(c)).join(', ')})`;

      case 'unique':
        return `CONSTRAINT ${this.quote(constraint.name)} UNIQUE (${constraint.columns.map((c) => this.quote(c)).join(', ')})`;

      case 'foreign':
        return `CONSTRAINT ${this.quote(constraint.name)} FOREIGN KEY (${constraint.columns.map((c) => this.quote(c)).join(', ')}) REFERENCES ${this.quote(constraint.references!.table)}(${constraint.references!.columns.map((c) => this.quote(c)).join(', ')})`;

      case 'check':
        return `CONSTRAINT ${this.quote(constraint.name)} CHECK (${constraint.check})`;

      default:
        throw new Error(`Unknown constraint type: ${constraint.type}`);
    }
  }

  /**
   * Map data type to SQL
   */
  private mapDataType(
    type: DataType,
    length?: number,
    precision?: number,
    scale?: number
  ): string {
    const typeMap: Record<string, Record<DataType, string>> = {
      postgres: {
        serial: 'SERIAL',
        bigserial: 'BIGSERIAL',
        integer: 'INTEGER',
        bigint: 'BIGINT',
        smallint: 'SMALLINT',
        decimal: precision ? `DECIMAL(${precision}${scale ? `, ${scale}` : ''})` : 'DECIMAL',
        numeric: precision ? `NUMERIC(${precision}${scale ? `, ${scale}` : ''})` : 'NUMERIC',
        real: 'REAL',
        double: 'DOUBLE PRECISION',
        'double precision': 'DOUBLE PRECISION',
        varchar: length ? `VARCHAR(${length})` : 'VARCHAR',
        char: length ? `CHAR(${length})` : 'CHAR(1)',
        text: 'TEXT',
        boolean: 'BOOLEAN',
        date: 'DATE',
        time: 'TIME',
        timestamp: 'TIMESTAMP',
        timestamptz: 'TIMESTAMPTZ',
        json: 'JSON',
        jsonb: 'JSONB',
        uuid: 'UUID',
        bytea: 'BYTEA',
        enum: 'VARCHAR(255)',  // Postgres enums need CREATE TYPE
      },
      sqlite: {
        serial: 'INTEGER',
        bigserial: 'INTEGER',
        integer: 'INTEGER',
        bigint: 'INTEGER',
        smallint: 'INTEGER',
        decimal: 'REAL',
        numeric: 'REAL',
        real: 'REAL',
        double: 'REAL',
        'double precision': 'REAL',
        varchar: 'TEXT',
        char: 'TEXT',
        text: 'TEXT',
        boolean: 'INTEGER',
        date: 'TEXT',
        time: 'TEXT',
        timestamp: 'TEXT',
        timestamptz: 'TEXT',
        json: 'TEXT',
        jsonb: 'TEXT',
        uuid: 'TEXT',
        bytea: 'BLOB',
        enum: 'TEXT',
      },
      mysql: {
        serial: 'INT AUTO_INCREMENT',
        bigserial: 'BIGINT AUTO_INCREMENT',
        integer: 'INT',
        bigint: 'BIGINT',
        smallint: 'SMALLINT',
        decimal: precision ? `DECIMAL(${precision}${scale ? `, ${scale}` : ''})` : 'DECIMAL',
        numeric: precision ? `NUMERIC(${precision}${scale ? `, ${scale}` : ''})` : 'NUMERIC',
        real: 'FLOAT',
        double: 'DOUBLE',
        'double precision': 'DOUBLE',
        varchar: length ? `VARCHAR(${length})` : 'VARCHAR(255)',
        char: length ? `CHAR(${length})` : 'CHAR(1)',
        text: 'TEXT',
        boolean: 'TINYINT(1)',
        date: 'DATE',
        time: 'TIME',
        timestamp: 'TIMESTAMP',
        timestamptz: 'TIMESTAMP',
        json: 'JSON',
        jsonb: 'JSON',
        uuid: 'CHAR(36)',
        bytea: 'BLOB',
        enum: 'VARCHAR(255)',
      },
    };

    return typeMap[this.options.dialect][type] ?? 'TEXT';
  }

  /**
   * Format default value
   */
  private formatDefault(value: unknown): string {
    if (value === null) {
      return 'NULL';
    }

    if (typeof value === 'string') {
      // Check for SQL expressions
      if (
        value.toUpperCase() === 'CURRENT_TIMESTAMP' ||
        value.toUpperCase() === 'NOW()' ||
        value.includes('(')
      ) {
        return value;
      }
      return `'${value.replace(/'/g, "''")}'`;
    }

    if (typeof value === 'boolean') {
      if (this.options.dialect === 'postgres') {
        return value ? 'TRUE' : 'FALSE';
      }
      return value ? '1' : '0';
    }

    return String(value);
  }

  /**
   * Quote identifier
   */
  private quote(identifier: string): string {
    if (this.options.dialect === 'mysql') {
      return `\`${identifier}\``;
    }
    return `"${identifier}"`;
  }

  /**
   * Generate version timestamp
   */
  private generateVersion(): string {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0')
    );
  }
}

/**
 * Create a migration generator
 */
export function createMigrationGenerator(
  options?: Partial<GeneratorOptions>
): MigrationGenerator {
  return new MigrationGenerator(options);
}

/**
 * Generate migration file content
 */
export function generateMigrationFileContent(
  migration: GeneratedMigration,
  format: 'ts' | 'js' | 'sql' = 'ts'
): string {
  if (format === 'sql') {
    return `-- Migration: ${migration.name}
-- Version: ${migration.version}

-- Up
${migration.up.join(';\n')};

-- Down
${migration.down.join(';\n')};
`;
  }

  const typeAnnotation = format === 'ts' ? ': MigrationFile' : '';

  return `/**
 * Migration: ${migration.name}
 * Version: ${migration.version}
 */

${format === 'ts' ? "import type { MigrationFile } from 'vexor-orm';\n" : ''}
export const migration${typeAnnotation} = {
  version: '${migration.version}',
  name: '${migration.name}',
  up: \`
${migration.up.join(';\n')}
\`,
  down: \`
${migration.down.join(';\n')}
\`,
};
`;
}
