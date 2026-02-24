/**
 * Query Builder
 *
 * Type-safe SQL query builder with fluent API.
 */

import type {
  TableDef,
  OrderDirection,
  JoinType,
  DatabaseDriver,
  QueryResult,
  InferSelectType,
} from '../core/types.js';

// ============ SQL Expressions ============

/**
 * SQL parameter placeholder
 */
let paramCounter = 0;

function resetParamCounter(): void {
  paramCounter = 0;
}

function nextParam(): string {
  return `$${++paramCounter}`;
}

/**
 * SQL value wrapper
 */
export class SQLValue {
  constructor(public readonly value: unknown) {}
}

/**
 * SQL raw expression
 */
export class SQLRaw {
  constructor(public readonly sql: string, public readonly values: unknown[] = []) {}
}

/**
 * Create raw SQL
 */
export function sql(strings: TemplateStringsArray, ...values: unknown[]): SQLRaw {
  const sqlParts: string[] = [];
  const sqlValues: unknown[] = [];

  for (let i = 0; i < strings.length; i++) {
    sqlParts.push(strings[i]);
    if (i < values.length) {
      if (values[i] instanceof SQLRaw) {
        const raw = values[i] as SQLRaw;
        sqlParts.push(raw.sql);
        sqlValues.push(...raw.values);
      } else {
        sqlParts.push(nextParam());
        sqlValues.push(values[i]);
      }
    }
  }

  return new SQLRaw(sqlParts.join(''), sqlValues);
}

// ============ Comparison Operators ============

/**
 * WHERE condition
 */
export interface WhereCondition {
  toSQL(): string;
  getValues(): unknown[];
}

/**
 * Column comparison
 */
class ColumnComparison implements WhereCondition {
  constructor(
    private column: string,
    private op: string,
    private value: unknown
  ) {}

  toSQL(): string {
    if (this.op === 'IS NULL' || this.op === 'IS NOT NULL') {
      return `${this.column} ${this.op}`;
    }
    if (this.op === 'IN' || this.op === 'NOT IN') {
      const values = this.value as unknown[];
      const placeholders = values.map(() => nextParam()).join(', ');
      return `${this.column} ${this.op} (${placeholders})`;
    }
    return `${this.column} ${this.op} ${nextParam()}`;
  }

  getValues(): unknown[] {
    if (this.op === 'IS NULL' || this.op === 'IS NOT NULL') {
      return [];
    }
    if (this.op === 'IN' || this.op === 'NOT IN') {
      return this.value as unknown[];
    }
    return [this.value];
  }
}

/**
 * AND/OR combination
 */
class CombinedCondition implements WhereCondition {
  constructor(
    private conditions: WhereCondition[],
    private operator: 'AND' | 'OR'
  ) {}

  toSQL(): string {
    const parts = this.conditions.map((c) => `(${c.toSQL()})`);
    return parts.join(` ${this.operator} `);
  }

  getValues(): unknown[] {
    return this.conditions.flatMap((c) => c.getValues());
  }
}

/**
 * Comparison operators for columns
 */
export function eq<T>(column: string, value: T): WhereCondition {
  return new ColumnComparison(column, '=', value);
}

export function ne<T>(column: string, value: T): WhereCondition {
  return new ColumnComparison(column, '!=', value);
}

export function lt<T>(column: string, value: T): WhereCondition {
  return new ColumnComparison(column, '<', value);
}

export function gt<T>(column: string, value: T): WhereCondition {
  return new ColumnComparison(column, '>', value);
}

export function lte<T>(column: string, value: T): WhereCondition {
  return new ColumnComparison(column, '<=', value);
}

export function gte<T>(column: string, value: T): WhereCondition {
  return new ColumnComparison(column, '>=', value);
}

export function like(column: string, pattern: string): WhereCondition {
  return new ColumnComparison(column, 'LIKE', pattern);
}

export function ilike(column: string, pattern: string): WhereCondition {
  return new ColumnComparison(column, 'ILIKE', pattern);
}

export function inArray<T>(column: string, values: T[]): WhereCondition {
  return new ColumnComparison(column, 'IN', values);
}

export function notInArray<T>(column: string, values: T[]): WhereCondition {
  return new ColumnComparison(column, 'NOT IN', values);
}

export function isNull(column: string): WhereCondition {
  return new ColumnComparison(column, 'IS NULL', null);
}

export function isNotNull(column: string): WhereCondition {
  return new ColumnComparison(column, 'IS NOT NULL', null);
}

export function and(...conditions: WhereCondition[]): WhereCondition {
  return new CombinedCondition(conditions, 'AND');
}

export function or(...conditions: WhereCondition[]): WhereCondition {
  return new CombinedCondition(conditions, 'OR');
}

// ============ Query Builders ============

/**
 * Base query builder
 */
abstract class BaseQueryBuilder {
  protected _values: unknown[] = [];

  abstract toSQL(): string;

  getValues(): unknown[] {
    return this._values;
  }

  async execute<T>(driver: DatabaseDriver): Promise<QueryResult<T>> {
    resetParamCounter();
    const sql = this.toSQL();
    return driver.query<T>(sql, this.getValues());
  }
}

/**
 * SELECT query builder
 */
export class SelectBuilder<T extends TableDef, TResult = InferSelectType<T['columns']>> extends BaseQueryBuilder {
  private _table: T;
  private _columns: string[] = ['*'];
  private _where: WhereCondition[] = [];
  private _orderBy: { column: string; direction: OrderDirection }[] = [];
  private _limit?: number;
  private _offset?: number;
  private _joins: { type: JoinType; table: string; on: string }[] = [];
  private _groupBy: string[] = [];
  private _having: WhereCondition[] = [];
  private _distinct = false;

  constructor(table: T) {
    super();
    this._table = table;
  }

  /**
   * Select specific columns
   */
  select<K extends keyof T['columns']>(...columns: K[]): SelectBuilder<T, Pick<InferSelectType<T['columns']>, K>> {
    this._columns = columns as string[];
    return this as unknown as SelectBuilder<T, Pick<InferSelectType<T['columns']>, K>>;
  }

  /**
   * Select all columns
   */
  selectAll(): SelectBuilder<T, InferSelectType<T['columns']>> {
    this._columns = ['*'];
    return this as unknown as SelectBuilder<T, InferSelectType<T['columns']>>;
  }

  /**
   * Add DISTINCT
   */
  distinct(): this {
    this._distinct = true;
    return this;
  }

  /**
   * Add WHERE condition
   */
  where(condition: WhereCondition): this {
    this._where.push(condition);
    return this;
  }

  /**
   * Add ORDER BY
   */
  orderBy(column: keyof T['columns'], direction: OrderDirection = 'asc'): this {
    this._orderBy.push({ column: column as string, direction });
    return this;
  }

  /**
   * Add LIMIT
   */
  limit(count: number): this {
    this._limit = count;
    return this;
  }

  /**
   * Add OFFSET
   */
  offset(count: number): this {
    this._offset = count;
    return this;
  }

  /**
   * Add JOIN
   */
  join<J extends TableDef>(
    table: J,
    on: string,
    type: JoinType = 'inner'
  ): this {
    this._joins.push({
      type,
      table: table.tableName,
      on,
    });
    return this;
  }

  /**
   * Add LEFT JOIN
   */
  leftJoin<J extends TableDef>(table: J, on: string): this {
    return this.join(table, on, 'left');
  }

  /**
   * Add RIGHT JOIN
   */
  rightJoin<J extends TableDef>(table: J, on: string): this {
    return this.join(table, on, 'right');
  }

  /**
   * Add GROUP BY
   */
  groupBy(...columns: (keyof T['columns'])[]): this {
    this._groupBy = columns as string[];
    return this;
  }

  /**
   * Add HAVING
   */
  having(condition: WhereCondition): this {
    this._having.push(condition);
    return this;
  }

  /**
   * Build SQL string
   */
  toSQL(): string {
    resetParamCounter();
    this._values = [];

    const parts: string[] = [];

    // SELECT
    const distinctStr = this._distinct ? 'DISTINCT ' : '';
    const columnsStr = this._columns.join(', ');
    parts.push(`SELECT ${distinctStr}${columnsStr}`);

    // FROM
    parts.push(`FROM ${this._table.tableName}`);

    // JOINs
    for (const join of this._joins) {
      const joinType = join.type.toUpperCase();
      parts.push(`${joinType} JOIN ${join.table} ON ${join.on}`);
    }

    // WHERE
    if (this._where.length > 0) {
      const conditions = this._where.map((w) => {
        this._values.push(...w.getValues());
        return w.toSQL();
      });
      parts.push(`WHERE ${conditions.join(' AND ')}`);
    }

    // GROUP BY
    if (this._groupBy.length > 0) {
      parts.push(`GROUP BY ${this._groupBy.join(', ')}`);
    }

    // HAVING
    if (this._having.length > 0) {
      const conditions = this._having.map((h) => {
        this._values.push(...h.getValues());
        return h.toSQL();
      });
      parts.push(`HAVING ${conditions.join(' AND ')}`);
    }

    // ORDER BY
    if (this._orderBy.length > 0) {
      const orderParts = this._orderBy.map(
        (o) => `${o.column} ${o.direction.toUpperCase()}`
      );
      parts.push(`ORDER BY ${orderParts.join(', ')}`);
    }

    // LIMIT
    if (this._limit !== undefined) {
      parts.push(`LIMIT ${this._limit}`);
    }

    // OFFSET
    if (this._offset !== undefined) {
      parts.push(`OFFSET ${this._offset}`);
    }

    return parts.join(' ');
  }

  /**
   * Execute and return all rows
   */
  async all(driver: DatabaseDriver): Promise<TResult[]> {
    const result = await this.execute<TResult>(driver);
    return result.rows;
  }

  /**
   * Execute and return first row
   */
  async first(driver: DatabaseDriver): Promise<TResult | null> {
    this._limit = 1;
    const result = await this.execute<TResult>(driver);
    return result.rows[0] ?? null;
  }

  /**
   * Execute and return first row or throw
   */
  async firstOrThrow(driver: DatabaseDriver): Promise<TResult> {
    const row = await this.first(driver);
    if (!row) {
      throw new Error('No rows found');
    }
    return row;
  }
}

/**
 * INSERT query builder
 */
export class InsertBuilder<T extends TableDef> extends BaseQueryBuilder {
  private _table: T;
  private _insertValues: Record<string, unknown>[] = [];
  private _returning: string[] = [];
  private _onConflict?: {
    columns: string[];
    action: 'DO NOTHING' | 'DO UPDATE';
    update?: Record<string, unknown>;
  };

  constructor(table: T) {
    super();
    this._table = table;
  }

  /**
   * Set values to insert
   */
  values(data: Record<string, unknown> | Record<string, unknown>[]): this {
    this._insertValues = Array.isArray(data) ? data : [data];
    return this;
  }

  /**
   * Add RETURNING clause
   */
  returning<K extends keyof T['columns']>(...columns: K[]): this {
    this._returning = columns as string[];
    return this;
  }

  /**
   * Return all columns
   */
  returningAll(): this {
    this._returning = ['*'];
    return this;
  }

  /**
   * ON CONFLICT DO NOTHING
   */
  onConflictDoNothing(columns: (keyof T['columns'])[]): this {
    this._onConflict = {
      columns: columns as string[],
      action: 'DO NOTHING',
    };
    return this;
  }

  /**
   * ON CONFLICT DO UPDATE (upsert)
   */
  onConflictDoUpdate(
    columns: (keyof T['columns'])[],
    update: Partial<Record<keyof T['columns'], unknown>>
  ): this {
    this._onConflict = {
      columns: columns as string[],
      action: 'DO UPDATE',
      update: update as Record<string, unknown>,
    };
    return this;
  }

  /**
   * Build SQL string
   */
  toSQL(): string {
    resetParamCounter();

    if (this._insertValues.length === 0) {
      throw new Error('No values provided for INSERT');
    }

    // Get column names from first row
    const columns = Object.keys(this._insertValues[0]);
    const columnsStr = columns.join(', ');

    // Build value placeholders
    const valueRows = this._insertValues.map(() => {
      const placeholders = columns.map(() => nextParam());
      return `(${placeholders.join(', ')})`;
    });

    let sql = `INSERT INTO ${this._table.tableName} (${columnsStr}) VALUES ${valueRows.join(', ')}`;

    // ON CONFLICT
    if (this._onConflict) {
      const conflictCols = this._onConflict.columns.join(', ');
      sql += ` ON CONFLICT (${conflictCols}) ${this._onConflict.action}`;

      if (this._onConflict.action === 'DO UPDATE' && this._onConflict.update) {
        const updates = Object.entries(this._onConflict.update)
          .map(([col]) => `${col} = ${nextParam()}`)
          .join(', ');
        sql += ` SET ${updates}`;
      }
    }

    // RETURNING
    if (this._returning.length > 0) {
      sql += ` RETURNING ${this._returning.join(', ')}`;
    }

    return sql;
  }

  getValues(): unknown[] {
    const values: unknown[] = [];

    // Add insert values
    for (const row of this._insertValues) {
      values.push(...Object.values(row));
    }

    // Add conflict update values
    if (this._onConflict?.update) {
      values.push(...Object.values(this._onConflict.update));
    }

    return values;
  }
}

/**
 * UPDATE query builder
 */
export class UpdateBuilder<T extends TableDef> extends BaseQueryBuilder {
  private _table: T;
  private _set: Record<string, unknown> = {};
  private _where: WhereCondition[] = [];
  private _returning: string[] = [];

  constructor(table: T) {
    super();
    this._table = table;
  }

  /**
   * Set values to update
   */
  set(data: Partial<Record<keyof T['columns'], unknown>>): this {
    this._set = data as Record<string, unknown>;
    return this;
  }

  /**
   * Add WHERE condition
   */
  where(condition: WhereCondition): this {
    this._where.push(condition);
    return this;
  }

  /**
   * Add RETURNING clause
   */
  returning<K extends keyof T['columns']>(...columns: K[]): this {
    this._returning = columns as string[];
    return this;
  }

  /**
   * Return all columns
   */
  returningAll(): this {
    this._returning = ['*'];
    return this;
  }

  /**
   * Build SQL string
   */
  toSQL(): string {
    resetParamCounter();

    const columns = Object.keys(this._set);
    if (columns.length === 0) {
      throw new Error('No values provided for UPDATE');
    }

    const setParts = columns.map((col) => `${col} = ${nextParam()}`);

    let sql = `UPDATE ${this._table.tableName} SET ${setParts.join(', ')}`;

    // WHERE
    if (this._where.length > 0) {
      const conditions = this._where.map((w) => w.toSQL());
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    // RETURNING
    if (this._returning.length > 0) {
      sql += ` RETURNING ${this._returning.join(', ')}`;
    }

    return sql;
  }

  getValues(): unknown[] {
    const values = [...Object.values(this._set)];
    for (const where of this._where) {
      values.push(...where.getValues());
    }
    return values;
  }
}

/**
 * DELETE query builder
 */
export class DeleteBuilder<T extends TableDef> extends BaseQueryBuilder {
  private _table: T;
  private _where: WhereCondition[] = [];
  private _returning: string[] = [];

  constructor(table: T) {
    super();
    this._table = table;
  }

  /**
   * Add WHERE condition
   */
  where(condition: WhereCondition): this {
    this._where.push(condition);
    return this;
  }

  /**
   * Add RETURNING clause
   */
  returning<K extends keyof T['columns']>(...columns: K[]): this {
    this._returning = columns as string[];
    return this;
  }

  /**
   * Return all columns
   */
  returningAll(): this {
    this._returning = ['*'];
    return this;
  }

  /**
   * Build SQL string
   */
  toSQL(): string {
    resetParamCounter();

    let sql = `DELETE FROM ${this._table.tableName}`;

    // WHERE
    if (this._where.length > 0) {
      const conditions = this._where.map((w) => w.toSQL());
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    // RETURNING
    if (this._returning.length > 0) {
      sql += ` RETURNING ${this._returning.join(', ')}`;
    }

    return sql;
  }

  getValues(): unknown[] {
    const values: unknown[] = [];
    for (const where of this._where) {
      values.push(...where.getValues());
    }
    return values;
  }
}

// ============ Query Entry Points ============

/**
 * Start a SELECT query
 */
export function select<T extends TableDef>(table: T): SelectBuilder<T> {
  return new SelectBuilder(table);
}

/**
 * Alias for select
 */
export { select as from };

/**
 * Start an INSERT query
 */
export function insert<T extends TableDef>(table: T): InsertBuilder<T> {
  return new InsertBuilder(table);
}

/**
 * Start an UPDATE query
 */
export function update<T extends TableDef>(table: T): UpdateBuilder<T> {
  return new UpdateBuilder(table);
}

/**
 * Start a DELETE query
 */
export function deleteFrom<T extends TableDef>(table: T): DeleteBuilder<T> {
  return new DeleteBuilder(table);
}

/**
 * Alias for delete
 */
export { deleteFrom as del };
