/**
 * Column Definitions
 *
 * Fluent API for defining table columns with full type inference.
 */

import type {
  ColumnDef,
  ColumnBuilder,
  DataType,
  ForeignKeyRef,
} from './types.js';

/**
 * Column builder implementation
 */
class ColumnBuilderImpl<T, NotNull extends boolean = false, HasDefault extends boolean = false>
  implements ColumnBuilder<T, NotNull, HasDefault>
{
  readonly _type!: T;
  readonly _notNull!: NotNull;
  readonly _hasDefault!: HasDefault;

  private _dataType: DataType;
  private _notNullValue = false;
  private _hasDefaultValue = false;
  private _primaryKey = false;
  private _unique = false;
  private _defaultValue?: T | (() => T);
  private _references?: ForeignKeyRef;
  private _check?: string;
  private _length?: number;
  private _precision?: number;
  private _scale?: number;
  private _enumValues?: string[];

  constructor(
    dataType: DataType,
    options?: {
      length?: number;
      precision?: number;
      scale?: number;
      enumValues?: string[];
    }
  ) {
    this._dataType = dataType;
    this._length = options?.length;
    this._precision = options?.precision;
    this._scale = options?.scale;
    this._enumValues = options?.enumValues;
  }

  notNull(): ColumnBuilder<T, true, HasDefault> {
    this._notNullValue = true;
    return this as unknown as ColumnBuilder<T, true, HasDefault>;
  }

  primaryKey(): ColumnBuilder<T, true, HasDefault> {
    this._primaryKey = true;
    this._notNullValue = true;
    return this as unknown as ColumnBuilder<T, true, HasDefault>;
  }

  unique(): ColumnBuilder<T, NotNull, HasDefault> {
    this._unique = true;
    return this;
  }

  default(value: T | (() => T)): ColumnBuilder<T, NotNull, true> {
    this._defaultValue = value;
    this._hasDefaultValue = true;
    return this as unknown as ColumnBuilder<T, NotNull, true>;
  }

  defaultNow(): ColumnBuilder<T, NotNull, true> {
    // Special marker for NOW() default
    this._defaultValue = '__NOW__' as unknown as T;
    this._hasDefaultValue = true;
    return this as unknown as ColumnBuilder<T, NotNull, true>;
  }

  references(
    ref: () => ForeignKeyRef
  ): ColumnBuilder<T, NotNull, HasDefault> {
    this._references = ref();
    return this as unknown as ColumnBuilder<T, NotNull, HasDefault>;
  }

  check(expression: string): ColumnBuilder<T, NotNull, HasDefault> {
    this._check = expression;
    return this;
  }

  build(name: string): ColumnDef<T> {
    // Handle special CURRENT_TIMESTAMP default
    const defaultValue =
      this._defaultValue === '__NOW__' ? 'CURRENT_TIMESTAMP' : this._defaultValue;

    return {
      _type: undefined as unknown as T,
      _brand: 'ColumnDef',
      dataType: this._dataType,
      name,
      notNull: this._notNullValue,
      hasDefault: this._hasDefaultValue,
      primaryKey: this._primaryKey,
      unique: this._unique,
      defaultValue,
      references: this._references,
      check: this._check,
      length: this._length,
      precision: this._precision,
      scale: this._scale,
      enumValues: this._enumValues,
    };
  }

  // Additional getters for SQL generation
  getLength(): number | undefined {
    return this._length;
  }

  getPrecision(): number | undefined {
    return this._precision;
  }

  getScale(): number | undefined {
    return this._scale;
  }

  getEnumValues(): string[] | undefined {
    return this._enumValues;
  }
}

/**
 * Column type builders
 */
export const column = {
  // ============ Numeric Types ============

  /** Auto-incrementing integer (PostgreSQL SERIAL) */
  serial(): ColumnBuilder<number, false, true> {
    const builder = new ColumnBuilderImpl<number>('serial');
    return builder.default(0 as never) as ColumnBuilder<number, false, true>;
  },

  /** Auto-incrementing big integer (PostgreSQL BIGSERIAL) */
  bigserial(): ColumnBuilder<bigint, false, true> {
    const builder = new ColumnBuilderImpl<bigint>('bigserial');
    return builder.default(0n as never) as ColumnBuilder<bigint, false, true>;
  },

  /** Integer (-2147483648 to 2147483647) */
  integer(): ColumnBuilder<number> {
    return new ColumnBuilderImpl<number>('integer');
  },

  /** Big integer (-9223372036854775808 to 9223372036854775807) */
  bigint(): ColumnBuilder<bigint> {
    return new ColumnBuilderImpl<bigint>('bigint');
  },

  /** Small integer (-32768 to 32767) */
  smallint(): ColumnBuilder<number> {
    return new ColumnBuilderImpl<number>('smallint');
  },

  /** Decimal with precision and scale */
  decimal(precision?: number, scale?: number): ColumnBuilder<string> {
    return new ColumnBuilderImpl<string>('decimal', { precision, scale });
  },

  /** Numeric (alias for decimal) */
  numeric(precision?: number, scale?: number): ColumnBuilder<string> {
    return new ColumnBuilderImpl<string>('numeric', { precision, scale });
  },

  /** Single precision floating point */
  real(): ColumnBuilder<number> {
    return new ColumnBuilderImpl<number>('real');
  },

  /** Double precision floating point */
  doublePrecision(): ColumnBuilder<number> {
    return new ColumnBuilderImpl<number>('double');
  },

  // ============ String Types ============

  /** Variable-length character string */
  varchar(length?: number): ColumnBuilder<string> {
    return new ColumnBuilderImpl<string>('varchar', { length });
  },

  /** Fixed-length character string */
  char(length?: number): ColumnBuilder<string> {
    return new ColumnBuilderImpl<string>('char', { length });
  },

  /** Variable-length text (no length limit) */
  text(): ColumnBuilder<string> {
    return new ColumnBuilderImpl<string>('text');
  },

  // ============ Boolean Type ============

  /** Boolean (true/false) */
  boolean(): ColumnBuilder<boolean> {
    return new ColumnBuilderImpl<boolean>('boolean');
  },

  // ============ Date/Time Types ============

  /** Date (no time) */
  date(): ColumnBuilder<Date> {
    return new ColumnBuilderImpl<Date>('date');
  },

  /** Time (no date) */
  time(): ColumnBuilder<string> {
    return new ColumnBuilderImpl<string>('time');
  },

  /** Timestamp without timezone */
  timestamp(): ColumnBuilder<Date> {
    return new ColumnBuilderImpl<Date>('timestamp');
  },

  /** Timestamp with timezone */
  timestamptz(): ColumnBuilder<Date> {
    return new ColumnBuilderImpl<Date>('timestamptz');
  },

  // ============ JSON Types ============

  /** JSON data */
  json<T = unknown>(): ColumnBuilder<T> {
    return new ColumnBuilderImpl<T>('json');
  },

  /** Binary JSON (PostgreSQL JSONB) */
  jsonb<T = unknown>(): ColumnBuilder<T> {
    return new ColumnBuilderImpl<T>('jsonb');
  },

  // ============ Other Types ============

  /** UUID */
  uuid(): ColumnBuilder<string> {
    return new ColumnBuilderImpl<string>('uuid');
  },

  /** Binary data */
  bytea(): ColumnBuilder<Buffer> {
    return new ColumnBuilderImpl<Buffer>('bytea');
  },

  /** Enum type */
  enum<T extends string>(values: readonly T[]): ColumnBuilder<T> {
    return new ColumnBuilderImpl<T>('enum', { enumValues: [...values] as string[] }) as unknown as ColumnBuilder<T>;
  },
};

/**
 * Export column as 'col' for shorter syntax
 */
export { column as col };
