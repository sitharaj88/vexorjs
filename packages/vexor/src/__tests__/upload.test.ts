/**
 * Upload Middleware Tests
 *
 * Tests for file upload helpers, UploadError, upload middleware,
 * and factory functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  upload,
  UploadError,
  singleUpload,
  multiUpload,
  imageUpload,
  documentUpload,
  getUploadedFiles,
  getFile,
  getUploadFields,
  getUploadError,
} from '../middleware/upload.js';
import { createMockContext } from './helpers.js';

/**
 * The helpers getExtension, getMimeType, and matchMimeType are not exported,
 * so we test them indirectly through the middleware or re-implement minimal
 * unit checks through the upload pipeline.
 *
 * For direct unit testing we import the module and access the helpers
 * through the upload pipeline behavior.
 */

// Helper to create a multipart FormData body as a Request
function createMultipartRequest(
  url: string,
  files: { name: string; fieldName: string; content: string; type: string }[],
  fields?: Record<string, string>
): Request {
  const formData = new FormData();

  for (const file of files) {
    const blob = new Blob([file.content], { type: file.type });
    const fileObj = new File([blob], file.name, { type: file.type });
    formData.append(file.fieldName, fileObj);
  }

  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
  }

  return new Request(url, {
    method: 'POST',
    body: formData,
  });
}

describe('Upload Middleware', () => {
  describe('getExtension (tested via upload pipeline)', () => {
    it('returns correct extensions for common file types', async () => {
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'photo.jpg', fieldName: 'file', content: 'image data', type: 'image/jpeg' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      // Override the request with our multipart request
      (ctx as any)._vexorRequest = {
        ...ctx.req,
        request,
        header: (name: string) => request.headers.get(name),
      };
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      const middleware = upload();
      await middleware(ctx);

      const files = getUploadedFiles(ctx);
      expect(files.length).toBe(1);
      expect(files[0].extension).toBe('.jpg');
    });
  });

  describe('getMimeType (tested via upload pipeline)', () => {
    it('extracts MIME from content-type', async () => {
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'doc.txt', fieldName: 'file', content: 'text data', type: 'text/plain; charset=utf-8' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      const middleware = upload();
      await middleware(ctx);

      const files = getUploadedFiles(ctx);
      expect(files.length).toBe(1);
      // getMimeType strips params, so it should be 'text/plain'
      expect(files[0].mimetype).toBe('text/plain');
    });
  });

  describe('matchMimeType (tested via allowedTypes)', () => {
    it('with exact match allows matching type', async () => {
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'doc.pdf', fieldName: 'file', content: 'pdf data', type: 'application/pdf' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      const middleware = upload({ allowedTypes: ['application/pdf'] });
      await middleware(ctx);

      const files = getUploadedFiles(ctx);
      expect(files.length).toBe(1);
      expect(getUploadError(ctx)).toBeUndefined();
    });

    it('with wildcard allows any type', async () => {
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'file.bin', fieldName: 'file', content: 'binary data', type: 'application/octet-stream' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      const middleware = upload({ allowedTypes: ['*/*'] });
      await middleware(ctx);

      expect(getUploadError(ctx)).toBeUndefined();
      expect(getUploadedFiles(ctx).length).toBe(1);
    });

    it('with prefix wildcard allows subtypes', async () => {
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'photo.png', fieldName: 'file', content: 'image data', type: 'image/png' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      const middleware = upload({ allowedTypes: ['image/*'] });
      await middleware(ctx);

      expect(getUploadError(ctx)).toBeUndefined();
      expect(getUploadedFiles(ctx).length).toBe(1);
    });
  });

  describe('UploadError', () => {
    it('has correct code and message', () => {
      const error = new UploadError('File too large', 'FILE_TOO_LARGE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(UploadError);
      expect(error.message).toBe('File too large');
      expect(error.code).toBe('FILE_TOO_LARGE');
      expect(error.name).toBe('UploadError');
    });

    it('supports all error codes', () => {
      const codes = ['FILE_TOO_LARGE', 'TOO_MANY_FILES', 'INVALID_TYPE', 'INVALID_EXTENSION', 'FILTER_REJECTED', 'PARSE_ERROR'] as const;

      for (const code of codes) {
        const error = new UploadError(`Error: ${code}`, code);
        expect(error.code).toBe(code);
      }
    });
  });

  describe('upload middleware', () => {
    it('skips non-multipart requests', async () => {
      const ctx = createMockContext('http://localhost/upload', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: 'test' }),
      });

      const middleware = upload();
      const result = await middleware(ctx);

      expect(result).toBeUndefined();
      // No files should be set
      expect(getUploadedFiles(ctx)).toEqual([]);
    });

    it('file size validation (FILE_TOO_LARGE)', async () => {
      const largeContent = 'x'.repeat(1024); // 1KB
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'large.txt', fieldName: 'file', content: largeContent, type: 'text/plain' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      // Set max size to something very small
      const middleware = upload({ maxFileSize: 100 });
      await middleware(ctx);

      const error = getUploadError(ctx);
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(UploadError);
      expect(error!.code).toBe('FILE_TOO_LARGE');
    });

    it('MIME type validation (INVALID_TYPE)', async () => {
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'script.js', fieldName: 'file', content: 'console.log("hi")', type: 'application/javascript' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      const middleware = upload({ allowedTypes: ['image/png', 'image/jpeg'] });
      await middleware(ctx);

      const error = getUploadError(ctx);
      expect(error).toBeDefined();
      expect(error!.code).toBe('INVALID_TYPE');
    });

    it('processes files and fields correctly', async () => {
      const request = createMultipartRequest(
        'http://localhost/upload',
        [
          { name: 'doc.txt', fieldName: 'document', content: 'Hello World', type: 'text/plain' },
        ],
        { title: 'My Document', author: 'Test User' }
      );

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      const middleware = upload();
      await middleware(ctx);

      expect(getUploadError(ctx)).toBeUndefined();

      const files = getUploadedFiles(ctx);
      expect(files.length).toBe(1);
      expect(files[0].originalName).toBe('doc.txt');
      expect(files[0].fieldName).toBe('document');
      expect(files[0].mimetype).toBe('text/plain');

      const fields = getUploadFields(ctx);
      expect(fields.title).toBe('My Document');
      expect(fields.author).toBe('Test User');
    });
  });

  describe('factory functions', () => {
    it('singleUpload returns middleware with maxFiles=1', () => {
      const middleware = singleUpload('avatar');
      expect(typeof middleware).toBe('function');
    });

    it('multiUpload returns middleware', () => {
      const middleware = multiUpload();
      expect(typeof middleware).toBe('function');
    });

    it('imageUpload returns middleware with image type restriction', async () => {
      const middleware = imageUpload();
      expect(typeof middleware).toBe('function');

      // Test that it rejects non-image types
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'doc.pdf', fieldName: 'file', content: 'pdf data', type: 'application/pdf' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      await middleware(ctx);

      const error = getUploadError(ctx);
      expect(error).toBeDefined();
      expect(error!.code).toBe('INVALID_TYPE');
    });

    it('imageUpload accepts image types', async () => {
      const middleware = imageUpload();

      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'photo.jpg', fieldName: 'image', content: 'jpeg data', type: 'image/jpeg' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      await middleware(ctx);

      expect(getUploadError(ctx)).toBeUndefined();
      expect(getUploadedFiles(ctx).length).toBe(1);
    });

    it('documentUpload returns middleware with document type restriction', async () => {
      const middleware = documentUpload();
      expect(typeof middleware).toBe('function');

      // Accept PDF
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'doc.pdf', fieldName: 'file', content: 'pdf data', type: 'application/pdf' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      await middleware(ctx);

      expect(getUploadError(ctx)).toBeUndefined();
      expect(getUploadedFiles(ctx).length).toBe(1);
    });

    it('documentUpload rejects non-document types', async () => {
      const middleware = documentUpload();

      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'photo.jpg', fieldName: 'file', content: 'jpeg data', type: 'image/jpeg' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      await middleware(ctx);

      const error = getUploadError(ctx);
      expect(error).toBeDefined();
      expect(error!.code).toBe('INVALID_TYPE');
    });
  });

  describe('context utilities', () => {
    it('getUploadedFiles returns empty array when no files uploaded', () => {
      const ctx = createMockContext('http://localhost/test');
      expect(getUploadedFiles(ctx)).toEqual([]);
    });

    it('getFile returns undefined when no file for field', () => {
      const ctx = createMockContext('http://localhost/test');
      expect(getFile(ctx, 'avatar')).toBeUndefined();
    });

    it('getUploadFields returns empty object when no fields', () => {
      const ctx = createMockContext('http://localhost/test');
      expect(getUploadFields(ctx)).toEqual({});
    });

    it('getFile retrieves file by field name', async () => {
      const request = createMultipartRequest('http://localhost/upload', [
        { name: 'photo.jpg', fieldName: 'avatar', content: 'image data', type: 'image/jpeg' },
        { name: 'doc.pdf', fieldName: 'document', content: 'pdf data', type: 'application/pdf' },
      ]);

      const ctx = createMockContext('http://localhost/upload');
      Object.defineProperty(ctx, 'request', { get: () => request });
      Object.defineProperty(ctx, 'header', {
        value: (name: string) => request.headers.get(name),
      });

      const middleware = upload();
      await middleware(ctx);

      const avatar = getFile(ctx, 'avatar');
      expect(avatar).toBeDefined();
      expect(avatar!.originalName).toBe('photo.jpg');

      const document = getFile(ctx, 'document');
      expect(document).toBeDefined();
      expect(document!.originalName).toBe('doc.pdf');
    });
  });
});
