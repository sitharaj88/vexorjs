/**
 * File Upload Middleware
 *
 * Handles multipart form data uploads with size limits, type validation,
 * and storage options.
 */

import { randomUUID } from 'node:crypto';
import { createWriteStream, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { VexorContext } from '../core/context.js';

// ============================================================================
// Types
// ============================================================================

export interface UploadedFile {
  /** Original filename */
  originalName: string;
  /** Generated filename (if saved to disk) */
  filename?: string;
  /** File path (if saved to disk) */
  path?: string;
  /** MIME type */
  mimetype: string;
  /** File size in bytes */
  size: number;
  /** File buffer (if stored in memory) */
  buffer?: Buffer;
  /** Field name */
  fieldName: string;
  /** File extension */
  extension: string;
}

export interface UploadOptions {
  /**
   * Storage destination directory.
   * If not set, files are stored in memory.
   */
  dest?: string;

  /**
   * Maximum file size in bytes.
   * Default: 10MB (10 * 1024 * 1024)
   */
  maxFileSize?: number;

  /**
   * Maximum number of files.
   * Default: 10
   */
  maxFiles?: number;

  /**
   * Maximum number of fields.
   * Default: 100
   */
  maxFields?: number;

  /**
   * Maximum field name size.
   * Default: 100 bytes
   */
  maxFieldNameSize?: number;

  /**
   * Maximum field value size.
   * Default: 1MB
   */
  maxFieldValueSize?: number;

  /**
   * Allowed MIME types.
   * Default: All types allowed
   */
  allowedTypes?: string[];

  /**
   * Allowed file extensions.
   * Default: All extensions allowed
   */
  allowedExtensions?: string[];

  /**
   * Custom filename generator.
   * Default: UUID + original extension
   */
  filename?: (file: Partial<UploadedFile>) => string;

  /**
   * Filter function to accept/reject files.
   */
  filter?: (file: Partial<UploadedFile>) => boolean | Promise<boolean>;

  /**
   * Preserve file path in response.
   * Default: false (for security)
   */
  preservePath?: boolean;

  /**
   * Create destination directory if it doesn't exist.
   * Default: true
   */
  createDest?: boolean;
}

export interface UploadResult {
  /** Uploaded files by field name */
  files: Record<string, UploadedFile[]>;
  /** Form fields */
  fields: Record<string, string>;
  /** All uploaded files */
  allFiles: UploadedFile[];
}

export class UploadError extends Error {
  constructor(
    message: string,
    public code: 'FILE_TOO_LARGE' | 'TOO_MANY_FILES' | 'INVALID_TYPE' | 'INVALID_EXTENSION' | 'FILTER_REJECTED' | 'PARSE_ERROR'
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

// ============================================================================
// Helpers
// ============================================================================

function generateFilename(file: Partial<UploadedFile>): string {
  const uuid = randomUUID();
  const ext = file.extension || extname(file.originalName || '');
  return `${uuid}${ext}`;
}

function getExtension(filename: string): string {
  const ext = extname(filename).toLowerCase();
  return ext.startsWith('.') ? ext : `.${ext}`;
}

function getMimeType(contentType: string): string {
  return contentType.split(';')[0].trim().toLowerCase();
}

function matchMimeType(type: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (pattern === '*/*' || pattern === type) {
      return true;
    }
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      if (type.startsWith(prefix)) {
        return true;
      }
    }
  }
  return false;
}

// ============================================================================
// Default Options
// ============================================================================

const defaultOptions: Required<Omit<UploadOptions, 'dest' | 'allowedTypes' | 'allowedExtensions' | 'filter'>> & Partial<UploadOptions> = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  maxFields: 100,
  maxFieldNameSize: 100,
  maxFieldValueSize: 1024 * 1024, // 1MB
  filename: generateFilename,
  preservePath: false,
  createDest: true,
};

// ============================================================================
// Multipart Parser
// ============================================================================

async function parseMultipart(
  request: Request,
  options: Required<Omit<UploadOptions, 'dest' | 'allowedTypes' | 'allowedExtensions' | 'filter'>> & Partial<UploadOptions>
): Promise<UploadResult> {
  const contentType = request.headers.get('content-type') || '';

  if (!contentType.includes('multipart/form-data')) {
    throw new UploadError('Content-Type must be multipart/form-data', 'PARSE_ERROR');
  }

  const formData = await request.formData();
  const result: UploadResult = {
    files: {},
    fields: {},
    allFiles: [],
  };

  let fileCount = 0;
  let fieldCount = 0;

  for (const [name, value] of formData as unknown as Iterable<[string, FormDataEntryValue]>) {
    if (value instanceof File) {
      // Handle file
      fileCount++;

      if (fileCount > options.maxFiles) {
        throw new UploadError(
          `Too many files. Maximum allowed: ${options.maxFiles}`,
          'TOO_MANY_FILES'
        );
      }

      const file = value as File;
      const extension = getExtension(file.name);
      const mimetype = getMimeType(file.type);

      // Check file size
      if (file.size > options.maxFileSize) {
        throw new UploadError(
          `File "${file.name}" exceeds maximum size of ${options.maxFileSize} bytes`,
          'FILE_TOO_LARGE'
        );
      }

      // Check allowed types
      if (options.allowedTypes && !matchMimeType(mimetype, options.allowedTypes)) {
        throw new UploadError(
          `File type "${mimetype}" is not allowed`,
          'INVALID_TYPE'
        );
      }

      // Check allowed extensions
      if (options.allowedExtensions && !options.allowedExtensions.includes(extension)) {
        throw new UploadError(
          `File extension "${extension}" is not allowed`,
          'INVALID_EXTENSION'
        );
      }

      const uploadedFile: UploadedFile = {
        originalName: file.name,
        mimetype,
        size: file.size,
        fieldName: name,
        extension,
      };

      // Check filter
      if (options.filter) {
        const accepted = await options.filter(uploadedFile);
        if (!accepted) {
          throw new UploadError(
            `File "${file.name}" was rejected by filter`,
            'FILTER_REJECTED'
          );
        }
      }

      // Read file content
      const buffer = Buffer.from(await file.arrayBuffer());

      // Save to disk or memory
      if (options.dest) {
        // Ensure destination exists
        if (options.createDest && !existsSync(options.dest)) {
          mkdirSync(options.dest, { recursive: true });
        }

        const filename = options.filename(uploadedFile);
        const filepath = join(options.dest, filename);

        // Write file
        const writeStream = createWriteStream(filepath);
        writeStream.write(buffer);
        writeStream.end();

        uploadedFile.filename = filename;
        uploadedFile.path = options.preservePath ? filepath : undefined;
      } else {
        uploadedFile.buffer = buffer;
      }

      // Add to result
      if (!result.files[name]) {
        result.files[name] = [];
      }
      result.files[name].push(uploadedFile);
      result.allFiles.push(uploadedFile);
    } else {
      // Handle field
      fieldCount++;

      if (fieldCount > options.maxFields) {
        continue; // Skip extra fields
      }

      const strValue = String(value);
      if (strValue.length <= options.maxFieldValueSize) {
        result.fields[name] = strValue;
      }
    }
  }

  return result;
}

// ============================================================================
// Upload Middleware
// ============================================================================

/**
 * Create file upload middleware
 */
export function upload(options: UploadOptions = {}) {
  const opts = { ...defaultOptions, ...options } as Required<Omit<UploadOptions, 'dest' | 'allowedTypes' | 'allowedExtensions' | 'filter'>> & Partial<UploadOptions>;

  return async (ctx: VexorContext): Promise<void> => {
    const contentType = ctx.header('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return; // Not a multipart request
    }

    try {
      const result = await parseMultipart(ctx.request, opts);

      // Store in context
      (ctx as any).files = result.files;
      (ctx as any).uploadedFiles = result.allFiles;
      (ctx as any).uploadFields = result.fields;
    } catch (error) {
      if (error instanceof UploadError) {
        (ctx as any).uploadError = error;
      } else {
        (ctx as any).uploadError = new UploadError(
          'Failed to parse upload',
          'PARSE_ERROR'
        );
      }
    }
  };
}

/**
 * Get uploaded files from context
 */
export function getUploadedFiles(ctx: VexorContext): UploadedFile[] {
  return (ctx as any).uploadedFiles || [];
}

/**
 * Get uploaded files by field name
 */
export function getFilesByField(ctx: VexorContext, fieldName: string): UploadedFile[] {
  const files = (ctx as any).files || {};
  return files[fieldName] || [];
}

/**
 * Get single file by field name
 */
export function getFile(ctx: VexorContext, fieldName: string): UploadedFile | undefined {
  return getFilesByField(ctx, fieldName)[0];
}

/**
 * Get upload fields
 */
export function getUploadFields(ctx: VexorContext): Record<string, string> {
  return (ctx as any).uploadFields || {};
}

/**
 * Get upload error if any
 */
export function getUploadError(ctx: VexorContext): UploadError | undefined {
  return (ctx as any).uploadError;
}

/**
 * Delete uploaded file from disk
 */
export function deleteUploadedFile(file: UploadedFile): boolean {
  if (file.path) {
    try {
      unlinkSync(file.path);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Create upload middleware for single file
 */
export function singleUpload(_fieldName: string, options: UploadOptions = {}) {
  return upload({
    ...options,
    maxFiles: 1,
  });
}

/**
 * Create upload middleware for multiple files
 */
export function multiUpload(options: UploadOptions = {}) {
  return upload(options);
}

/**
 * Create upload middleware for specific fields
 */
export function fieldsUpload(
  fields: { name: string; maxCount?: number }[],
  options: UploadOptions = {}
) {
  const totalMaxFiles = fields.reduce((sum, f) => sum + (f.maxCount || 1), 0);

  return upload({
    ...options,
    maxFiles: totalMaxFiles,
  });
}

/**
 * Create upload middleware with type validation
 */
export function imageUpload(options: Omit<UploadOptions, 'allowedTypes'> = {}) {
  return upload({
    ...options,
    allowedTypes: ['image/*'],
  });
}

/**
 * Create upload middleware for documents
 */
export function documentUpload(options: Omit<UploadOptions, 'allowedTypes'> = {}) {
  return upload({
    ...options,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
  });
}
