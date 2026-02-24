import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { upload, getUploadedFiles } from '@vexorjs/core/middleware';

const app = new Vexor();

// Basic file upload with default options
app.post('/upload', {
  preHandler: [upload({ dest: './uploads' })],
}, async (ctx) => {
  const files = getUploadedFiles(ctx);

  return ctx.json({
    message: 'Files uploaded successfully',
    files: files.map((f) => ({
      name: f.originalName,
      size: f.size,
      type: f.mimetype,
      path: f.path,
    })),
  });
});

app.listen(3000);`;

const singleUploadCode = `import { singleUpload, getFile } from '@vexorjs/core/middleware';

// Accept a single file in the 'avatar' field
app.post('/users/:id/avatar', {
  preHandler: [singleUpload({
    fieldName: 'avatar',
    dest: './uploads/avatars',
    maxFileSize: 2 * 1024 * 1024,  // 2MB
  })],
}, async (ctx) => {
  const file = getFile(ctx, 'avatar');

  if (!file) {
    return ctx.status(400).json({ error: 'No file uploaded' });
  }

  // Save reference to database
  await db.update(users)
    .set({ avatarPath: file.path })
    .where(eq(users.id, ctx.params.id));

  return ctx.json({
    avatar: {
      url: \`/static/avatars/\${file.filename}\`,
      size: file.size,
    },
  });
});`;

const imageUploadCode = `import { imageUpload, getUploadedFiles } from '@vexorjs/core/middleware';

// Image-only upload with validation
app.post('/gallery', {
  preHandler: [imageUpload({
    dest: './uploads/gallery',
    maxFileSize: 5 * 1024 * 1024,     // 5MB per image
    maxFiles: 10,                      // Up to 10 images
    allowedTypes: [                    // Only specific image formats
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
  })],
}, async (ctx) => {
  const images = getUploadedFiles(ctx);

  const saved = await Promise.all(
    images.map(async (img) => {
      const record = await db.insert(galleryImages).values({
        filename: img.filename,
        originalName: img.originalName,
        mimetype: img.mimetype,
        size: img.size,
        path: img.path,
      }).returning();

      return record;
    })
  );

  return ctx.status(201).json({ images: saved });
});`;

const validationCode = `import { upload } from '@vexorjs/core/middleware';

// Strict validation rules
app.post('/documents', {
  preHandler: [upload({
    dest: './uploads/documents',
    maxFileSize: 10 * 1024 * 1024,       // 10MB
    maxFiles: 5,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
    filter: (file) => {
      // Custom validation logic
      if (file.originalName.includes('..')) {
        return false;  // Reject path traversal attempts
      }
      return true;
    },
  })],
}, async (ctx) => {
  const files = getUploadedFiles(ctx);
  return ctx.json({ uploaded: files.length });
});`;

const errorHandlingCode = `import { upload, UploadError } from '@vexorjs/core/middleware';

app.post('/upload', {
  preHandler: [upload({
    dest: './uploads',
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 3,
    allowedTypes: ['image/jpeg', 'image/png'],
  })],
}, handler);

// Handle upload errors globally
app.addHook('onError', async (ctx, error) => {
  if (error instanceof UploadError) {
    switch (error.code) {
      case 'FILE_TOO_LARGE':
        return ctx.status(413).json({
          error: 'File too large',
          message: \`Maximum file size is \${error.limit} bytes\`,
          file: error.field,
        });

      case 'TOO_MANY_FILES':
        return ctx.status(400).json({
          error: 'Too many files',
          message: \`Maximum \${error.limit} files allowed\`,
        });

      case 'INVALID_TYPE':
        return ctx.status(415).json({
          error: 'Invalid file type',
          message: \`\${error.mimetype} is not allowed\`,
          allowed: error.allowedTypes,
        });

      case 'INVALID_EXTENSION':
        return ctx.status(415).json({
          error: 'Invalid file extension',
          message: \`\${error.extension} is not allowed\`,
          allowed: error.allowedExtensions,
        });
    }
  }

  throw error;
});`;

const accessingFilesCode = `import {
  getUploadedFiles,
  getFile,
  getFilesByField,
  deleteUploadedFile,
} from '@vexorjs/core/middleware';
import { multiUpload } from '@vexorjs/core/middleware';

// Multi-field upload
app.post('/product', {
  preHandler: [multiUpload({
    dest: './uploads/products',
    maxFiles: 6,
  })],
}, async (ctx) => {
  // Get all uploaded files
  const allFiles = getUploadedFiles(ctx);

  // Get a specific file by field name
  const thumbnail = getFile(ctx, 'thumbnail');

  // Get all files for a specific field
  const gallery = getFilesByField(ctx, 'gallery');

  // Access file properties
  if (thumbnail) {
    console.log(thumbnail.originalName);  // 'photo.jpg'
    console.log(thumbnail.filename);      // 'a1b2c3d4-photo.jpg'
    console.log(thumbnail.path);          // './uploads/products/a1b2c3d4-photo.jpg'
    console.log(thumbnail.mimetype);      // 'image/jpeg'
    console.log(thumbnail.size);          // 245760
    console.log(thumbnail.buffer);        // Buffer (if no dest)
  }

  // Clean up a file
  if (thumbnail && !isValidImage(thumbnail)) {
    await deleteUploadedFile(thumbnail);
    return ctx.status(400).json({ error: 'Invalid thumbnail' });
  }

  return ctx.json({
    thumbnail: thumbnail?.path,
    gallery: gallery.map((f) => f.path),
  });
});`;

const documentUploadCode = `import { documentUpload } from '@vexorjs/core/middleware';

// Pre-configured for document uploads
app.post('/reports', {
  preHandler: [documentUpload({
    dest: './uploads/reports',
    maxFileSize: 20 * 1024 * 1024,  // 20MB
  })],
}, async (ctx) => {
  const files = getUploadedFiles(ctx);
  // Handles PDF, Word, Excel, PowerPoint, text files
  return ctx.json({ documents: files.length });
});`;

export default function Upload() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="file-upload" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          File Upload
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          File uploads are one of the most complex and security-sensitive operations in any web API.
          The server must parse multipart form data from the raw HTTP stream, enforce size limits to
          prevent denial-of-service attacks, validate file types to block malicious content, generate
          safe filenames to prevent path traversal vulnerabilities, and stream files to disk efficiently
          without exhausting memory. Vexor's upload middleware handles all of this out of the box,
          giving you a clean, safe API for accepting files from clients.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Under the hood, the upload middleware parses the{' '}
          <code className="prose-code">multipart/form-data</code> request body using a streaming parser
          that processes files as they arrive rather than buffering the entire request in memory. Each
          file part is validated against the configured constraints (size, type, extension, custom filter)
          as it streams in. If a file fails validation, the stream is aborted immediately and any partially
          written data is cleaned up. Files that pass validation are either written to the configured
          destination directory with a unique generated filename, or held in memory as a Buffer if no
          destination is specified.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Vexor provides several specialized upload middleware variants for common use cases:{' '}
          <code className="prose-code">singleUpload</code> for endpoints that accept exactly one file,{' '}
          <code className="prose-code">multiUpload</code> for multi-file uploads,{' '}
          <code className="prose-code">imageUpload</code> pre-configured for image MIME types, and{' '}
          <code className="prose-code">documentUpload</code> pre-configured for office documents and PDFs.
          All variants share the same validation engine and error handling, so the behavior is consistent
          regardless of which variant you use.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a client sends a <code className="prose-code">multipart/form-data</code> request, the HTTP body
          contains one or more "parts" separated by a boundary string. Each part has its own headers (including{' '}
          <code className="prose-code">Content-Disposition</code> with the field name and filename, and{' '}
          <code className="prose-code">Content-Type</code> with the MIME type) followed by the file data. The
          upload middleware parses this structure incrementally, processing one part at a time without loading
          the entire request body into memory.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For each file part, the middleware performs validation in order: first it checks the file count against{' '}
          <code className="prose-code">maxFiles</code>, then the MIME type against{' '}
          <code className="prose-code">allowedTypes</code>, then the file extension against{' '}
          <code className="prose-code">allowedExtensions</code>, and finally runs the custom{' '}
          <code className="prose-code">filter</code> function if provided. If any check fails, the middleware
          throws an <code className="prose-code">UploadError</code> with a specific error code, the file
          stream is aborted, and any partially written file is deleted from disk. This fail-fast approach means
          invalid files are rejected as early as possible, saving both bandwidth and disk I/O.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          File size validation happens during streaming: the middleware tracks bytes received for each file
          and aborts the stream as soon as the <code className="prose-code">maxFileSize</code> limit is
          exceeded. This prevents a client from uploading a very large file that fills up your disk -- the
          upload is terminated at the configured limit, not after the entire file has been received.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Files that pass all validation are saved with a unique generated filename (a UUID prefix followed
          by the original filename) to prevent naming collisions and path traversal attacks. The original
          filename, generated filename, full path, MIME type, and file size are stored in an{' '}
          <code className="prose-code">UploadedFile</code> object that is attached to the request context.
          Your handler then retrieves these objects using helper functions like{' '}
          <code className="prose-code">getUploadedFiles</code> or{' '}
          <code className="prose-code">getFile</code>.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Choosing the Right Upload Variant
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use <code className="prose-code">upload</code></strong> (the general-purpose variant) when
          you need full control over the upload configuration, or when your endpoint accepts a mix of file
          types that do not fit neatly into the image or document categories. This is the most flexible
          option and gives you access to all configuration parameters.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use <code className="prose-code">singleUpload</code></strong> for endpoints that accept
          exactly one file from a specific form field -- for example, avatar uploads, profile pictures, or
          single document attachments. The <code className="prose-code">fieldName</code> option restricts
          the middleware to only process the named field, and it automatically rejects requests that contain
          more than one file.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use <code className="prose-code">imageUpload</code></strong> for endpoints that should only
          accept image files. This variant pre-configures the MIME type filter to allow common image formats
          (JPEG, PNG, GIF, WebP, SVG) and rejects all non-image content. You can further restrict the allowed
          formats using the <code className="prose-code">allowedTypes</code> option.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use <code className="prose-code">documentUpload</code></strong> for endpoints that accept
          office documents and PDFs. This variant pre-configures the MIME type filter for PDF, Word, Excel,
          PowerPoint, and plain text files. Like <code className="prose-code">imageUpload</code>, you can
          customize the allowed types further.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use in-memory mode</strong> (omit the <code className="prose-code">dest</code> option) when
          you need to process the file content without writing it to disk -- for example, when you are going to
          upload the file to a cloud storage service (S3, GCS) or process it in a pipeline. In this mode, the
          file content is available as a Buffer on the <code className="prose-code">file.buffer</code> property.
          Be mindful of memory usage: large files in memory mode can cause out-of-memory errors.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">upload</code> middleware parses multipart form data
          and saves files to the specified destination directory. It runs as a{' '}
          <code className="prose-code">preHandler</code>, which means it processes the upload before your
          route handler executes. By the time your handler runs, all files have been validated, saved, and
          are ready to access through the helper functions.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">dest</code> directory is created automatically if it does not
          exist. Each uploaded file receives a unique filename (UUID prefix + original name) to prevent
          collisions. The original filename is preserved in the{' '}
          <code className="prose-code">originalName</code> property of the{' '}
          <code className="prose-code">UploadedFile</code> object, so you can display it to users or store
          it in your database alongside the generated path.
        </p>
        <CodeBlock code={basicUsageCode} showLineNumbers />
        <InfoBlock variant="info" title="Destination Directory">
          The <code className="prose-code">dest</code> directory is created automatically if it
          does not exist. If <code className="prose-code">dest</code> is omitted, files are stored
          in memory as Buffers accessible via <code className="prose-code">file.buffer</code>. Use
          disk storage for most cases and reserve in-memory mode for small files that will be
          immediately forwarded to cloud storage.
        </InfoBlock>
      </section>

      {/* Single File */}
      <section>
        <h2 id="single-file" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Single File Upload
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">singleUpload</code> variant is designed for endpoints that accept
          exactly one file from a named form field. This is the most common upload pattern -- avatar images,
          profile photos, resume attachments, and configuration file imports all follow this model. By
          specifying the <code className="prose-code">fieldName</code>, you tell the middleware to only accept
          a file in that specific form field and ignore (or reject) files in other fields.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the <code className="prose-code">getFile</code> helper to retrieve the uploaded file by field
          name. The function returns <code className="prose-code">undefined</code> if no file was uploaded in
          that field, so always check for this case in your handler. A missing file might be expected (optional
          avatar during profile creation) or an error (required document missing from a submission form),
          depending on your application's requirements.
        </p>
        <CodeBlock code={singleUploadCode} showLineNumbers />
      </section>

      {/* Image Upload */}
      <section>
        <h2 id="image-upload" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Image Upload
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">imageUpload</code> middleware is pre-configured to only
          accept image MIME types, saving you from manually specifying the list of allowed image formats.
          By default, it accepts all standard image types (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF). You can
          further restrict the allowed formats using the <code className="prose-code">allowedTypes</code> option
          to accept only the formats your application supports.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For gallery and multi-image endpoints, combine <code className="prose-code">imageUpload</code> with
          the <code className="prose-code">maxFiles</code> option to control how many images can be uploaded
          in a single request. Each image is validated individually against the size and type constraints,
          so one oversized image in a batch will reject only that image (or the entire request, depending
          on your error handling strategy) while valid images are saved normally.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">documentUpload</code> variant works the same way but for office
          documents. It pre-configures the MIME type filter for PDF, Word (.doc, .docx), Excel (.xls, .xlsx),
          PowerPoint (.ppt, .pptx), and plain text files. This is convenient for applications that handle
          document submissions, report uploads, or file import features.
        </p>
        <CodeBlock code={imageUploadCode} showLineNumbers />
        <InfoBlock variant="tip" title="Document Upload">
          Use <code className="prose-code">documentUpload</code> for a similar pre-configured
          middleware that accepts PDF, Word, Excel, PowerPoint, and text files. It is the document
          equivalent of <code className="prose-code">imageUpload</code>.
        </InfoBlock>
        <CodeBlock code={documentUploadCode} />
      </section>

      {/* Validation */}
      <section>
        <h2 id="validation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Validation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          File validation is a multi-layered defense. The upload middleware provides three built-in
          validation mechanisms that work together: MIME type checking via{' '}
          <code className="prose-code">allowedTypes</code>, file extension checking via{' '}
          <code className="prose-code">allowedExtensions</code>, and a custom{' '}
          <code className="prose-code">filter</code> function for application-specific logic. All three
          are applied before the file is written to disk, so rejected files never touch your filesystem.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          MIME type validation checks the <code className="prose-code">Content-Type</code> header that the
          client sends for each file part. This is the most common form of type checking, but it has an
          important limitation: MIME types are self-declared by the client and can be spoofed. A malicious
          client can upload an executable file with a <code className="prose-code">Content-Type: image/jpeg</code>{' '}
          header. This is why extension validation exists as a second layer -- it checks the actual file
          extension against the allowed list, which provides an additional signal (though extensions can
          also be faked).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For the highest level of security, use the custom <code className="prose-code">filter</code> function
          to implement application-specific validation. Common checks include rejecting filenames with path
          traversal sequences (<code className="prose-code">..</code>), checking file magic bytes (the first
          few bytes of the file that identify its true format), scanning for malware, or enforcing naming
          conventions. The filter function receives the full{' '}
          <code className="prose-code">UploadedFile</code> object and returns{' '}
          <code className="prose-code">true</code> to accept or{' '}
          <code className="prose-code">false</code> to reject.
        </p>
        <CodeBlock code={validationCode} showLineNumbers />
        <InfoBlock variant="warning" title="Security">
          Always validate both MIME type and file extension. Do not rely solely on MIME type,
          as it can be spoofed by the client. For high-security applications, consider validating
          file magic bytes (the first few bytes that identify the true file format) in your custom
          filter function, and scan uploaded files for malware before processing them.
        </InfoBlock>
      </section>

      {/* Error Handling */}
      <section>
        <h2 id="error-handling" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Error Handling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a file fails validation, the upload middleware throws an{' '}
          <code className="prose-code">UploadError</code> with a specific error code that identifies
          exactly what went wrong. The error object also includes contextual information like the
          configured limit, the offending field name, the rejected MIME type, or the invalid extension,
          depending on the error type. This structured error makes it straightforward to return helpful
          error messages to the client.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The recommended approach is to handle upload errors in a global{' '}
          <code className="prose-code">onError</code> hook using a switch statement on the error code.
          This keeps your route handlers clean (they only run when the upload succeeds) and ensures
          consistent error responses across all upload endpoints. The error codes are string constants
          (<code className="prose-code">FILE_TOO_LARGE</code>,{' '}
          <code className="prose-code">TOO_MANY_FILES</code>,{' '}
          <code className="prose-code">INVALID_TYPE</code>,{' '}
          <code className="prose-code">INVALID_EXTENSION</code>) that map to standard HTTP status codes:
          413 for size violations, 415 for type violations, and 400 for count violations.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Include the allowed values in your error responses so clients know what is accepted. For example,
          when rejecting an invalid MIME type, include the list of allowed types in the response body. This
          saves the client developer from having to look up your documentation for every error, and it makes
          debugging easier when the allowed list changes between environments.
        </p>
        <CodeBlock code={errorHandlingCode} showLineNumbers />
      </section>

      {/* Accessing Files */}
      <section>
        <h2 id="accessing-files" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Accessing Files
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          After the upload middleware runs, uploaded files are attached to the request context and
          accessible through a set of helper functions. These functions provide different levels of access
          depending on what you need: all files at once, a single file by field name, or all files for
          a specific field. Each file is represented as an <code className="prose-code">UploadedFile</code>{' '}
          object containing metadata about the original file and its storage location.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">getUploadedFiles</code> function returns an array of all
          uploaded files, regardless of which form field they came from. This is useful when you need to
          process all files uniformly. The <code className="prose-code">getFile</code> function returns
          the first file from a specific form field (or <code className="prose-code">undefined</code> if no
          file was uploaded in that field), which is the right choice for single-file fields. The{' '}
          <code className="prose-code">getFilesByField</code> function returns all files for a specific field,
          which is needed for multi-file fields like a gallery upload where multiple files share the same
          field name.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">deleteUploadedFile</code> function removes an uploaded file from
          disk. This is useful for cleanup when post-upload validation fails -- for example, if you accept
          an image upload but then determine that the image dimensions are incorrect or the content is
          inappropriate. Always clean up files that your application will not use to prevent orphaned files
          from accumulating on disk.
        </p>
        <CodeBlock code={accessingFilesCode} showLineNumbers />
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Always set explicit size limits.</strong> The default{' '}
          <code className="prose-code">maxFileSize</code> of 5MB is reasonable for many use cases, but you
          should set it based on what your endpoint actually needs. An avatar upload should have a much lower
          limit (1-2MB) than a document import (10-50MB). Explicit limits prevent accidental resource
          exhaustion and make your API's expectations clear.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Validate at multiple layers.</strong> Use <code className="prose-code">allowedTypes</code>{' '}
          for MIME type checking, <code className="prose-code">allowedExtensions</code> for extension
          checking, and a custom <code className="prose-code">filter</code> for any additional validation.
          No single check is sufficient on its own because clients can spoof both MIME types and extensions.
          For high-security applications, also validate file magic bytes in your handler after the upload
          completes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Never serve uploaded files directly.</strong> Store uploads in a directory that is not
          directly accessible via your web server. Instead, serve them through a separate handler that
          validates access permissions and sets appropriate headers (Content-Type, Content-Disposition).
          Serving untrusted files directly can lead to XSS attacks if a user uploads an HTML file.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Plan for cleanup.</strong> Implement a background job or cron task that periodically
          removes orphaned files -- uploads that were saved to disk but never referenced by your application
          (for example, because the user abandoned the form or the subsequent database write failed). Without
          cleanup, upload directories will grow indefinitely.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The upload module provides several middleware variants for different upload patterns, a set of
          helper functions for accessing uploaded files, and a structured error type for handling
          validation failures.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          upload(options)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The general-purpose upload middleware. Parses multipart form data, validates files against the
          configured constraints, and saves accepted files to disk or holds them in memory. Returns a
          Vexor middleware suitable for use as a <code className="prose-code">preHandler</code>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">dest</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The filesystem directory where uploaded files are saved. The directory is created automatically if it does not exist. When omitted, files are held in memory as Buffers accessible via file.buffer. Use disk storage for most cases; reserve in-memory mode for small files that will be immediately forwarded to cloud storage or processed in-line.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">maxFileSize</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">5242880 (5MB)</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The maximum allowed size of a single file in bytes. This limit is enforced during streaming -- the upload is aborted as soon as the limit is exceeded, so oversized files do not consume the full configured amount of bandwidth or disk space. Set this to the smallest value that accommodates your legitimate use case.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">maxFiles</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">10</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The maximum number of files that can be uploaded in a single request, across all form fields. When this limit is exceeded, the middleware throws a TOO_MANY_FILES error and any files that have already been processed in the current request are cleaned up from disk.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">allowedTypes</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">An array of MIME type strings that are accepted. When set, files with a Content-Type not in this list are rejected with an INVALID_TYPE error. When omitted, all MIME types are accepted. Use this for the first layer of type validation, but remember that MIME types are self-declared by the client and can be spoofed.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">allowedExtensions</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">An array of file extensions (including the leading dot) that are accepted. When set, files with an extension not in this list are rejected with an INVALID_EXTENSION error. Use this alongside allowedTypes for defense-in-depth: validate both the declared MIME type and the file extension to reduce the risk of spoofed content.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">filter</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(file: UploadedFile) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">A custom function for application-specific validation. Called after type and extension checks pass. Receives the UploadedFile object and returns true to accept or false to reject. Use this for checks like rejecting filenames with path traversal sequences, enforcing naming conventions, or validating file magic bytes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          UploadedFile Properties
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each uploaded file is represented as an object with the following properties. These are available
          in your handler after the upload middleware has processed the request.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Property</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">originalName</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The filename as provided by the client in the Content-Disposition header. This is the name the user sees in their file picker. Use this for display purposes but never use it directly in filesystem paths, as it may contain path traversal sequences or characters that are invalid on your operating system.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">filename</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The unique filename generated by the middleware, consisting of a UUID prefix followed by the sanitized original filename. This is the actual name of the file on disk. Use this for filesystem operations and URL construction.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">path</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The full filesystem path to the saved file, combining the dest directory and the generated filename. Only present when a dest directory was configured. Use this to read, move, or delete the file after upload.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">mimetype</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The MIME type of the file as declared by the client in the Content-Type header of the multipart part. This is the value that was validated against allowedTypes. Remember that this is client-declared and can be spoofed -- do not rely on it for security-critical decisions without additional validation.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">size</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The size of the file in bytes. This is the actual number of bytes written to disk (or held in memory), not the value declared by the client. Use this for storage quota tracking, billing calculations, or displaying file size to users.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">buffer</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Buffer | undefined</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The file contents as a Node.js Buffer. Only present when no dest directory was configured (in-memory mode). When dest is set, this property is undefined and the file content is available on disk at the path specified by the path property.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Helper Functions
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          These functions provide access to uploaded files from the request context. They are available
          in your route handler after the upload middleware has processed the request.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getUploadedFiles</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ctx: Context) =&gt; UploadedFile[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns an array of all uploaded files from the request, regardless of which form field they belong to. Returns an empty array if no files were uploaded. Use this when you need to process all files uniformly.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getFile</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ctx: Context, fieldName: string) =&gt; UploadedFile | undefined</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns the first uploaded file for the specified form field name, or undefined if no file was uploaded in that field. Use this for single-file fields like avatar uploads. If multiple files share the same field name, only the first is returned -- use getFilesByField instead.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getFilesByField</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ctx: Context, fieldName: string) =&gt; UploadedFile[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns all uploaded files for the specified form field name. Use this for multi-file fields like a gallery upload where multiple files share the same field name (e.g., multiple inputs with name="gallery").</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">deleteUploadedFile</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(file: UploadedFile) =&gt; Promise&lt;void&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Deletes an uploaded file from disk. Use this for cleanup when post-upload validation fails, such as when an image does not meet dimension requirements or content moderation rejects the file. Throws if the file has already been deleted or does not exist on disk.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">singleUpload</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(options?: UploadOptions & {'{ fieldName?: string }'}) =&gt; Middleware</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates upload middleware configured for a single file from a specific form field. Accepts the same options as upload() plus an optional fieldName to restrict which field is accepted. Automatically sets maxFiles to 1.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">multiUpload</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(options?: UploadOptions) =&gt; Middleware</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates upload middleware that accepts multiple files from any form field. Functionally equivalent to upload() but semantically clearer when your endpoint is designed for multi-file uploads.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">imageUpload</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(options?: UploadOptions) =&gt; Middleware</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates upload middleware pre-configured to only accept image MIME types (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF). You can further restrict the allowed formats using the allowedTypes option, which overrides the default image type list.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">documentUpload</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(options?: UploadOptions) =&gt; Middleware</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates upload middleware pre-configured to accept document MIME types (PDF, Word, Excel, PowerPoint, plain text). Like imageUpload, you can further restrict the allowed types using the allowedTypes option.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          UploadError Codes
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The upload middleware throws <code className="prose-code">UploadError</code> instances with the
          following codes when validation fails. Handle these in your global error hook for consistent
          error responses.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">FILE_TOO_LARGE</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The file size exceeds the configured maxFileSize limit. The upload was aborted during streaming as soon as the limit was reached. The error object includes a limit property with the configured maximum in bytes and a field property with the form field name. Return HTTP 413 (Payload Too Large).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">TOO_MANY_FILES</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The number of files in the request exceeds the configured maxFiles limit. The error object includes a limit property with the configured maximum. Files that were already processed before the limit was reached are cleaned up from disk. Return HTTP 400 (Bad Request).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">INVALID_TYPE</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The file's MIME type (Content-Type) is not in the configured allowedTypes list. The error object includes mimetype (the rejected type) and allowedTypes (the configured list). Return HTTP 415 (Unsupported Media Type).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">INVALID_EXTENSION</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The file's extension is not in the configured allowedExtensions list. The error object includes extension (the rejected extension) and allowedExtensions (the configured list). Return HTTP 415 (Unsupported Media Type).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/middleware/health" className="btn-primary">
            Health Check Middleware <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/middleware" className="btn-secondary">
            Middleware Overview
          </Link>
        </div>
      </section>
    </div>
  );
}
