import CodeBlock from '../../components/CodeBlock';

const globalErrorCode = `import { Vexor } from 'vexor';

const app = new Vexor();

// Global error handler
app.addHook('onError', async (ctx, error) => {
  // Log error (in production, send to monitoring service)
  console.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    path: ctx.req.path,
    method: ctx.req.method,
  });

  // Don't expose internal errors in production
  const isDev = process.env.NODE_ENV === 'development';

  return ctx.status(500).json({
    error: 'Internal Server Error',
    message: isDev ? error.message : 'Something went wrong',
    ...(isDev && { stack: error.stack }),
  });
});`;

const customErrorsCode = `// Define custom error classes
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', \`\${resource} not found\`);
  }
}

class ValidationError extends AppError {
  constructor(public details: Array<{ field: string; message: string }>) {
    super(400, 'VALIDATION_ERROR', 'Validation failed');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

// Use in handlers
app.get('/users/:id', async (ctx) => {
  const user = await findUser(ctx.params.id);
  if (!user) {
    throw new NotFoundError('User');
  }
  return ctx.json(user);
});`;

const errorHandlerCode = `// Handle different error types
app.addHook('onError', async (ctx, error) => {
  // Handle custom application errors
  if (error instanceof AppError) {
    return ctx.status(error.statusCode).json({
      error: error.code,
      message: error.message,
      ...(error instanceof ValidationError && { details: error.details }),
    });
  }

  // Handle Vexor validation errors
  if (error.name === 'ValidationError') {
    return ctx.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.issues,
    });
  }

  // Handle database errors
  if (error.code === '23505') { // PostgreSQL unique violation
    return ctx.status(409).json({
      error: 'CONFLICT',
      message: 'Resource already exists',
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  // Generic error response
  return ctx.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
});`;

const asyncErrorsCode = `// Async errors are automatically caught
app.get('/data', async (ctx) => {
  // This error will be caught by onError hook
  const data = await fetchExternalAPI();
  if (!data) {
    throw new Error('Failed to fetch data');
  }
  return ctx.json(data);
});

// Handling promise rejections
app.get('/multiple', async (ctx) => {
  try {
    const [users, posts] = await Promise.all([
      fetchUsers(),
      fetchPosts(),
    ]);
    return ctx.json({ users, posts });
  } catch (error) {
    // Handle specific errors
    if (error.message.includes('timeout')) {
      return ctx.status(504).json({ error: 'Request timeout' });
    }
    throw error; // Re-throw for global handler
  }
});`;

const errorResponsesCode = `// Standard error response format
interface ErrorResponse {
  error: string;      // Error code (e.g., 'NOT_FOUND', 'VALIDATION_ERROR')
  message: string;    // Human-readable message
  details?: unknown;  // Additional error details
  requestId?: string; // For tracing (optional)
}

// Example responses:

// 400 Bad Request
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Must be at least 8 characters" }
  ]
}

// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}

// 404 Not Found
{
  "error": "NOT_FOUND",
  "message": "User not found"
}

// 500 Internal Server Error
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "requestId": "abc123"
}`;

const notFoundCode = `// Handle 404 for unmatched routes
app.addHook('onRequest', async (ctx) => {
  // This runs after routing, so we can check if route was found
});

// Better approach: Add a catch-all route at the end
app.all('*', async (ctx) => {
  return ctx.status(404).json({
    error: 'NOT_FOUND',
    message: \`Route \${ctx.req.method} \${ctx.req.path} not found\`,
  });
});`;

export default function ErrorHandling() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="error-handling" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Error Handling Guide
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how to handle errors gracefully in your Vexor application.
        </p>
      </div>

      <section>
        <h2 id="global-handler" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Global Error Handler
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Catch all unhandled errors with the <code className="prose-code">onError</code> hook.
        </p>
        <CodeBlock code={globalErrorCode} showLineNumbers />
      </section>

      <section>
        <h2 id="custom-errors" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Custom Error Classes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create custom error classes for different error types.
        </p>
        <CodeBlock code={customErrorsCode} showLineNumbers />
      </section>

      <section>
        <h2 id="error-types" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Handling Different Error Types
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Handle application errors, validation errors, and database errors differently.
        </p>
        <CodeBlock code={errorHandlerCode} showLineNumbers />
      </section>

      <section>
        <h2 id="async-errors" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Async Error Handling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Async errors in handlers are automatically caught.
        </p>
        <CodeBlock code={asyncErrorsCode} />
      </section>

      <section>
        <h2 id="error-format" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Error Response Format
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use a consistent error response format across your API.
        </p>
        <CodeBlock code={errorResponsesCode} language="typescript" />
      </section>

      <section>
        <h2 id="not-found" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Handling 404 Routes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Return proper 404 responses for unmatched routes.
        </p>
        <CodeBlock code={notFoundCode} />
      </section>
    </div>
  );
}
