/**
 * Schema Diffing — automatic migration generation.
 *
 * Compares a saved schema snapshot against the current `table()` definitions
 * and produces the SQL migration that transforms one into the other:
 *
 *   const snapshot = loadSnapshotSomehow();          // previous state (or null)
 *   const diff = diffSchemas(snapshot, [users, posts]);
 *   if (diff.hasChanges) {
 *     const migration = generateMigrationFromDiff(diff, { dialect: 'postgres' });
 *     // migration.up / migration.down / migration.warnings
 *     const next = snapshotSchema([users, posts]);   // persist for next run
 *   }
 *
 * The snapshot is a plain-JSON serialization of the table definitions, so it
 * can be committed to the repository (e.g. .vexor/schema.json) exactly like
 * drizzle-kit's metadata.
 */

import type { TableDef, ColumnDef, IndexDef } from '../core/types.js';
import { MigrationGenerator, type GeneratorOptions } from './generator.js';

// ============ Snapshot format ============

export interface SnapshotColumn {
  dataType: string;
  notNull: boolean;
  hasDefault: boolean;
  defaultValue?: unknown;
  primaryKey: boolean;
  unique: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  enumValues?: string[];
  references?: {
    table: string;
    column: string;
    onDelete?: string;
    onUpdate?: string;
  };
}

export interface SnapshotTable {
  name: string;
  columns: Record<string, SnapshotColumn>;
  indexes: IndexDef[];
}

export interface SchemaSnapshot {
  version: 1;
  dialect?: string;
  tables: SnapshotTable[];
}

/**
 * Serialize table definitions into a plain-JSON snapshot
 */
export function snapshotSchema(tables: TableDef[], dialect?: string): SchemaSnapshot {
  return {
    version: 1,
    ...(dialect && { dialect }),
    tables: tables.map((table) => ({
      name: table.tableName,
      columns: Object.fromEntries(
        Object.entries(table.columns).map(([name, column]) => [
          name,
          snapshotColumn(column as ColumnDef),
        ])
      ),
      indexes: table.indexes ? [...table.indexes] : [],
    })),
  };
}

function snapshotColumn(column: ColumnDef): SnapshotColumn {
  return {
    dataType: column.dataType,
    notNull: column.notNull,
    hasDefault: column.hasDefault,
    ...(column.defaultValue !== undefined && { defaultValue: column.defaultValue }),
    primaryKey: column.primaryKey,
    unique: column.unique,
    ...(column.length !== undefined && { length: column.length }),
    ...(column.precision !== undefined && { precision: column.precision }),
    ...(column.scale !== undefined && { scale: column.scale }),
    ...(column.enumValues && { enumValues: [...column.enumValues] }),
    ...(column.references && {
      references: {
        table: column.references.table,
        column: column.references.column,
        ...(column.references.onDelete && { onDelete: column.references.onDelete }),
        ...(column.references.onUpdate && { onUpdate: column.references.onUpdate }),
      },
    }),
  };
}

// ============ Diff computation ============

export interface ColumnChange {
  name: string;
  from: SnapshotColumn;
  to: SnapshotColumn;
}

export interface TableChange {
  table: string;
  addedColumns: Array<{ name: string; column: SnapshotColumn }>;
  removedColumns: Array<{ name: string; column: SnapshotColumn }>;
  changedColumns: ColumnChange[];
  addedIndexes: IndexDef[];
  removedIndexes: IndexDef[];
}

export interface SchemaDiff {
  /** Tables present now but not in the snapshot */
  addedTables: SnapshotTable[];
  /** Tables present in the snapshot but not now */
  removedTables: SnapshotTable[];
  /** Tables present in both with differences */
  changedTables: TableChange[];
  hasChanges: boolean;
}

function columnsEqual(a: SnapshotColumn, b: SnapshotColumn): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function indexKey(index: IndexDef): string {
  return JSON.stringify({
    name: index.name,
    columns: index.columns,
    unique: index.unique,
    where: index.where ?? null,
    using: index.using ?? null,
  });
}

/**
 * Compute the difference between a previous snapshot and the current
 * table definitions. Pass `null` as the snapshot on first run — every
 * table is then reported as added.
 */
export function diffSchemas(
  previous: SchemaSnapshot | null,
  current: TableDef[]
): SchemaDiff {
  const target = snapshotSchema(current);
  const previousTables = new Map((previous?.tables ?? []).map((t) => [t.name, t]));
  const currentTables = new Map(target.tables.map((t) => [t.name, t]));

  const addedTables: SnapshotTable[] = [];
  const removedTables: SnapshotTable[] = [];
  const changedTables: TableChange[] = [];

  for (const [name, table] of currentTables) {
    if (!previousTables.has(name)) {
      addedTables.push(table);
    }
  }

  for (const [name, table] of previousTables) {
    if (!currentTables.has(name)) {
      removedTables.push(table);
    }
  }

  for (const [name, currentTable] of currentTables) {
    const previousTable = previousTables.get(name);
    if (!previousTable) continue;

    const change: TableChange = {
      table: name,
      addedColumns: [],
      removedColumns: [],
      changedColumns: [],
      addedIndexes: [],
      removedIndexes: [],
    };

    for (const [columnName, column] of Object.entries(currentTable.columns)) {
      const previousColumn = previousTable.columns[columnName];
      if (!previousColumn) {
        change.addedColumns.push({ name: columnName, column });
      } else if (!columnsEqual(previousColumn, column)) {
        change.changedColumns.push({ name: columnName, from: previousColumn, to: column });
      }
    }

    for (const [columnName, column] of Object.entries(previousTable.columns)) {
      if (!currentTable.columns[columnName]) {
        change.removedColumns.push({ name: columnName, column });
      }
    }

    const previousIndexes = new Map(previousTable.indexes.map((i) => [indexKey(i), i]));
    const currentIndexes = new Map(currentTable.indexes.map((i) => [indexKey(i), i]));
    for (const [key, index] of currentIndexes) {
      if (!previousIndexes.has(key)) change.addedIndexes.push(index);
    }
    for (const [key, index] of previousIndexes) {
      if (!currentIndexes.has(key)) change.removedIndexes.push(index);
    }

    if (
      change.addedColumns.length ||
      change.removedColumns.length ||
      change.changedColumns.length ||
      change.addedIndexes.length ||
      change.removedIndexes.length
    ) {
      changedTables.push(change);
    }
  }

  return {
    addedTables,
    removedTables,
    changedTables,
    hasChanges: addedTables.length > 0 || removedTables.length > 0 || changedTables.length > 0,
  };
}

// ============ Migration generation ============

export interface DiffMigration {
  up: string[];
  down: string[];
  /** Human-readable notes about operations that need manual attention */
  warnings: string[];
}

/** Rebuild a TableDef-shaped object from a snapshot table for SQL generation */
function snapshotToTableDef(table: SnapshotTable): TableDef {
  const columns: Record<string, ColumnDef> = {};
  for (const [name, column] of Object.entries(table.columns)) {
    columns[name] = {
      _type: undefined,
      _brand: 'ColumnDef',
      dataType: column.dataType,
      notNull: column.notNull,
      hasDefault: column.hasDefault,
      defaultValue: column.defaultValue,
      primaryKey: column.primaryKey,
      unique: column.unique,
      length: column.length,
      precision: column.precision,
      scale: column.scale,
      enumValues: column.enumValues,
      references: column.references,
    } as ColumnDef;
  }
  return {
    _brand: 'TableDef',
    tableName: table.name,
    columns,
    indexes: table.indexes,
  } as TableDef;
}

/**
 * Turn a SchemaDiff into executable up/down SQL for the given dialect
 */
export function generateMigrationFromDiff(
  diff: SchemaDiff,
  options: Partial<GeneratorOptions> = {}
): DiffMigration {
  const generator = new MigrationGenerator(options);
  const dialect = options.dialect ?? 'postgres';
  const up: string[] = [];
  const down: string[] = [];
  const warnings: string[] = [];

  // New tables (with their indexes)
  for (const table of diff.addedTables) {
    const migration = generator.createTable(snapshotToTableDef(table));
    up.push(...migration.up);
    down.unshift(...migration.down);
  }

  // Removed tables — recreate them on rollback from the snapshot
  for (const table of diff.removedTables) {
    const drop = generator.dropTable(table.name);
    up.push(...drop.up);
    const recreate = generator.createTable(snapshotToTableDef(table));
    down.unshift(...recreate.up);
  }

  // Changed tables
  for (const change of diff.changedTables) {
    for (const { name, column } of change.addedColumns) {
      const columnDef = snapshotToTableDef({
        name: change.table,
        columns: { [name]: column },
        indexes: [],
      }).columns[name];
      const migration = generator.addColumn(change.table, name, columnDef);
      up.push(...migration.up);
      down.unshift(...migration.down);

      if (column.notNull && !column.hasDefault) {
        warnings.push(
          `Column "${change.table}"."${name}" is NOT NULL without a default; ` +
            'adding it will fail on tables with existing rows unless you provide a default.'
        );
      }
    }

    for (const { name, column } of change.removedColumns) {
      const migration = generator.dropColumn(change.table, name);
      up.push(...migration.up);
      // Rollback: restore the column from the snapshot
      const columnDef = snapshotToTableDef({
        name: change.table,
        columns: { [name]: column },
        indexes: [],
      }).columns[name];
      down.unshift(...generator.addColumn(change.table, name, columnDef).up);
    }

    for (const { name, from, to } of change.changedColumns) {
      if (dialect === 'sqlite') {
        warnings.push(
          `Column "${change.table}"."${name}" changed (${from.dataType} → ${to.dataType}); ` +
            'SQLite cannot ALTER COLUMN — recreate the table manually or use a new column.'
        );
        up.push(
          `-- TODO(sqlite): column "${change.table}"."${name}" changed; manual table rebuild required`
        );
        continue;
      }

      type MutableChanges = {
        dataType?: ColumnDef['dataType'];
        notNull?: boolean;
        hasDefault?: boolean;
        defaultValue?: unknown;
      };

      const changes: MutableChanges = {};
      if (from.dataType !== to.dataType) changes.dataType = to.dataType as ColumnDef['dataType'];
      if (from.notNull !== to.notNull) changes.notNull = to.notNull;
      if (
        from.hasDefault !== to.hasDefault ||
        JSON.stringify(from.defaultValue) !== JSON.stringify(to.defaultValue)
      ) {
        changes.hasDefault = to.hasDefault;
        changes.defaultValue = to.defaultValue;
      }

      const migration = generator.alterColumn(change.table, name, changes as Partial<ColumnDef>);
      up.push(...migration.up);

      // Rollback: alter back to the previous definition
      const reverse: MutableChanges = {};
      if (from.dataType !== to.dataType) reverse.dataType = from.dataType as ColumnDef['dataType'];
      if (from.notNull !== to.notNull) reverse.notNull = from.notNull;
      down.unshift(...generator.alterColumn(change.table, name, reverse as Partial<ColumnDef>).up);
    }

    for (const index of change.addedIndexes) {
      const migration = generator.addIndex(change.table, index);
      up.push(...migration.up);
      down.unshift(...migration.down);
    }

    for (const index of change.removedIndexes) {
      const migration = generator.dropIndex(index.name);
      up.push(...migration.up);
      down.unshift(...generator.addIndex(change.table, index).up);
    }
  }

  return { up, down, warnings };
}

/**
 * One-call convenience: diff and generate in a single step
 */
export function generateAutoMigration(
  previous: SchemaSnapshot | null,
  current: TableDef[],
  options: Partial<GeneratorOptions> = {}
): DiffMigration & { snapshot: SchemaSnapshot; hasChanges: boolean } {
  const diff = diffSchemas(previous, current);
  const migration = diff.hasChanges
    ? generateMigrationFromDiff(diff, options)
    : { up: [], down: [], warnings: [] };
  return {
    ...migration,
    snapshot: snapshotSchema(current, options.dialect),
    hasChanges: diff.hasChanges,
  };
}
