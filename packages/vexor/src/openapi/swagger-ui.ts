/**
 * Swagger UI Integration for Vexor
 *
 * Provides built-in Swagger UI for API documentation with:
 * - Self-hosted Swagger UI (no CDN dependency)
 * - Dark mode support
 * - Custom themes
 * - Authentication support
 * - Configurable options
 */

import type { Vexor } from '../core/app.js';
import type { VexorContext } from '../core/context.js';

// ============================================================================
// Types
// ============================================================================

export interface SwaggerUIOptions {
  /**
   * Path to serve Swagger UI
   * @default '/docs'
   */
  path?: string;

  /**
   * Path to OpenAPI spec
   * @default '/openapi.json'
   */
  specPath?: string;

  /**
   * OpenAPI specification object (if not using specPath)
   */
  spec?: OpenAPISpec;

  /**
   * Page title
   * @default 'API Documentation'
   */
  title?: string;

  /**
   * Favicon URL
   */
  favicon?: string;

  /**
   * Enable dark mode
   * @default false
   */
  darkMode?: boolean;

  /**
   * Custom CSS
   */
  customCss?: string;

  /**
   * Custom JavaScript
   */
  customJs?: string;

  /**
   * Swagger UI version to use from CDN
   * @default '5.11.0'
   */
  version?: string;

  /**
   * Use local assets instead of CDN
   */
  localAssets?: {
    cssPath: string;
    jsPath: string;
  };

  /**
   * Default models expansion depth
   * @default 1
   */
  defaultModelsExpandDepth?: number;

  /**
   * Default model expansion depth
   * @default 1
   */
  defaultModelExpandDepth?: number;

  /**
   * Display request duration
   * @default true
   */
  displayRequestDuration?: boolean;

  /**
   * Filter operations by tag
   * @default true
   */
  filter?: boolean;

  /**
   * Operations sorter
   * @default 'alpha'
   */
  operationsSorter?: 'alpha' | 'method';

  /**
   * Show extensions
   * @default false
   */
  showExtensions?: boolean;

  /**
   * Show common extensions
   * @default true
   */
  showCommonExtensions?: boolean;

  /**
   * Enable syntax highlighting
   * @default true
   */
  syntaxHighlight?: boolean | {
    theme?: 'agate' | 'arta' | 'monokai' | 'nord' | 'obsidian' | 'tomorrow-night';
  };

  /**
   * Enable try it out by default
   * @default false
   */
  tryItOutEnabled?: boolean;

  /**
   * Persist authorization
   * @default true
   */
  persistAuthorization?: boolean;

  /**
   * Deep linking
   * @default true
   */
  deepLinking?: boolean;

  /**
   * Doc expansion
   * @default 'list'
   */
  docExpansion?: 'list' | 'full' | 'none';

  /**
   * OAuth configuration
   */
  oauth?: {
    clientId?: string;
    clientSecret?: string;
    realm?: string;
    appName?: string;
    scopeSeparator?: string;
    scopes?: string;
    additionalQueryStringParams?: Record<string, string>;
    useBasicAuthenticationWithAccessCodeGrant?: boolean;
    usePkceWithAuthorizationCodeGrant?: boolean;
  };

  /**
   * Preauthorize API key
   */
  preauthorize?: {
    authDefinitionKey: string;
    apiKeyValue: string;
  };
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: {
      name?: string;
      url?: string;
      email?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
  };
  servers?: Array<{
    url: string;
    description?: string;
    variables?: Record<string, {
      enum?: string[];
      default: string;
      description?: string;
    }>;
  }>;
  paths: Record<string, Record<string, unknown>>;
  components?: Record<string, unknown>;
  security?: Array<Record<string, string[]>>;
  tags?: Array<{
    name: string;
    description?: string;
    externalDocs?: {
      description?: string;
      url: string;
    };
  }>;
  externalDocs?: {
    description?: string;
    url: string;
  };
}

// ============================================================================
// Dark Mode Styles
// ============================================================================

const darkModeStyles = `
  body {
    background: #1a1a2e;
  }
  .swagger-ui {
    filter: invert(88%) hue-rotate(180deg);
  }
  .swagger-ui .microlight {
    filter: invert(100%) hue-rotate(180deg);
  }
  .swagger-ui img, .swagger-ui svg:not([class]) {
    filter: invert(100%) hue-rotate(180deg);
  }
  .swagger-ui .model-box {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const modernStyles = `
  :root {
    --vexor-primary: #6366f1;
    --vexor-primary-dark: #4f46e5;
  }

  .swagger-ui .topbar {
    background-color: var(--vexor-primary);
    padding: 15px 0;
  }

  .swagger-ui .topbar .download-url-wrapper .select-label select {
    border-color: rgba(255, 255, 255, 0.5);
  }

  .swagger-ui .info .title {
    color: var(--vexor-primary-dark);
  }

  .swagger-ui .btn.execute {
    background-color: var(--vexor-primary);
    border-color: var(--vexor-primary);
  }

  .swagger-ui .btn.execute:hover {
    background-color: var(--vexor-primary-dark);
    border-color: var(--vexor-primary-dark);
  }

  .swagger-ui .opblock.opblock-get .opblock-summary-method {
    background: #10b981;
  }

  .swagger-ui .opblock.opblock-post .opblock-summary-method {
    background: #3b82f6;
  }

  .swagger-ui .opblock.opblock-put .opblock-summary-method {
    background: #f59e0b;
  }

  .swagger-ui .opblock.opblock-patch .opblock-summary-method {
    background: #8b5cf6;
  }

  .swagger-ui .opblock.opblock-delete .opblock-summary-method {
    background: #ef4444;
  }

  .swagger-ui .opblock.opblock-get {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  .swagger-ui .opblock.opblock-post {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }

  .swagger-ui .opblock.opblock-put {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  .swagger-ui .opblock.opblock-patch {
    border-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.1);
  }

  .swagger-ui .opblock.opblock-delete {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .swagger-ui section.models {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .swagger-ui .model-container {
    background: #f9fafb;
    border-radius: 4px;
  }

  .swagger-ui .response-col_status {
    font-size: 14px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .swagger-ui table.responses-table {
    border-radius: 4px;
    overflow: hidden;
  }
`;

// ============================================================================
// HTML Template
// ============================================================================

function generateHTML(options: Required<SwaggerUIOptions>): string {
  const cssUrl = options.localAssets?.cssPath
    || `https://unpkg.com/swagger-ui-dist@${options.version}/swagger-ui.css`;
  const jsUrl = options.localAssets?.jsPath
    || `https://unpkg.com/swagger-ui-dist@${options.version}/swagger-ui-bundle.js`;

  const syntaxHighlightConfig = typeof options.syntaxHighlight === 'object'
    ? JSON.stringify({
        activated: true,
        theme: options.syntaxHighlight.theme || 'monokai',
      })
    : options.syntaxHighlight;

  const swaggerUIConfig = {
    url: options.spec ? undefined : options.specPath,
    spec: options.spec,
    dom_id: '#swagger-ui',
    deepLinking: options.deepLinking,
    displayRequestDuration: options.displayRequestDuration,
    filter: options.filter,
    operationsSorter: options.operationsSorter,
    showExtensions: options.showExtensions,
    showCommonExtensions: options.showCommonExtensions,
    syntaxHighlight: syntaxHighlightConfig,
    tryItOutEnabled: options.tryItOutEnabled,
    persistAuthorization: options.persistAuthorization,
    docExpansion: options.docExpansion,
    defaultModelsExpandDepth: options.defaultModelsExpandDepth,
    defaultModelExpandDepth: options.defaultModelExpandDepth,
    presets: ['SwaggerUIBundle.presets.apis', 'SwaggerUIStandalonePreset'],
    plugins: ['SwaggerUIBundle.plugins.DownloadUrl'],
    layout: 'StandaloneLayout',
  };

  const oauthConfig = options.oauth
    ? `ui.initOAuth(${JSON.stringify(options.oauth)});`
    : '';

  const preauthorizeConfig = options.preauthorize
    ? `ui.preauthorizeApiKey("${options.preauthorize.authDefinitionKey}", "${options.preauthorize.apiKeyValue}");`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  ${options.favicon ? `<link rel="icon" type="image/png" href="${options.favicon}">` : ''}
  <link rel="stylesheet" type="text/css" href="${cssUrl}">
  <style>
    html {
      box-sizing: border-box;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      padding: 0;
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }
    ${modernStyles}
    ${options.darkMode ? darkModeStyles : ''}
    ${options.customCss || ''}
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${jsUrl}"></script>
  <script src="https://unpkg.com/swagger-ui-dist@${options.version}/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const configJson = ${JSON.stringify(swaggerUIConfig)};

      // Convert string references to actual objects
      configJson.presets = [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ];
      configJson.plugins = [
        SwaggerUIBundle.plugins.DownloadUrl
      ];

      const ui = SwaggerUIBundle(configJson);
      ${oauthConfig}
      ${preauthorizeConfig}
      window.ui = ui;
    };
  </script>
  ${options.customJs ? `<script>${options.customJs}</script>` : ''}
</body>
</html>`;
}

// ============================================================================
// Middleware
// ============================================================================

/**
 * Create Swagger UI middleware for Vexor
 */
export function swaggerUI(options: SwaggerUIOptions = {}) {
  const fullOptions: Required<SwaggerUIOptions> = {
    path: '/docs',
    specPath: '/openapi.json',
    spec: undefined as any,
    title: 'API Documentation',
    favicon: '',
    darkMode: false,
    customCss: '',
    customJs: '',
    version: '5.11.0',
    localAssets: undefined as any,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayRequestDuration: true,
    filter: true,
    operationsSorter: 'alpha',
    showExtensions: false,
    showCommonExtensions: true,
    syntaxHighlight: true,
    tryItOutEnabled: false,
    persistAuthorization: true,
    deepLinking: true,
    docExpansion: 'list',
    oauth: undefined as any,
    preauthorize: undefined as any,
    ...options,
  };

  return async (ctx: VexorContext): Promise<Response | void> => {
    const path = ctx.path;

    // Serve Swagger UI HTML
    if (path === fullOptions.path || path === fullOptions.path + '/') {
      const html = generateHTML(fullOptions);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Continue to next middleware
    return;
  };
}

// ============================================================================
// Route Registration
// ============================================================================

/**
 * Register Swagger UI routes on a Vexor app
 */
export function registerSwaggerUI(app: Vexor, options: SwaggerUIOptions = {}): void {
  const path = options.path || '/docs';
  const specPath = options.specPath || '/openapi.json';

  const fullOptions: Required<SwaggerUIOptions> = {
    path,
    specPath,
    spec: undefined as any,
    title: 'API Documentation',
    favicon: '',
    darkMode: false,
    customCss: '',
    customJs: '',
    version: '5.11.0',
    localAssets: undefined as any,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayRequestDuration: true,
    filter: true,
    operationsSorter: 'alpha',
    showExtensions: false,
    showCommonExtensions: true,
    syntaxHighlight: true,
    tryItOutEnabled: false,
    persistAuthorization: true,
    deepLinking: true,
    docExpansion: 'list',
    oauth: undefined as any,
    preauthorize: undefined as any,
    ...options,
  };

  // Register HTML page route
  app.get(path, async (_ctx) => {
    const html = generateHTML(fullOptions);
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  });

  // Register OpenAPI spec route if spec is provided
  if (options.spec) {
    app.get(specPath, async (ctx) => {
      return ctx.json(options.spec);
    });
  }
}

// ============================================================================
// ReDoc Alternative
// ============================================================================

export interface ReDocOptions {
  /**
   * Path to serve ReDoc
   * @default '/redoc'
   */
  path?: string;

  /**
   * Path to OpenAPI spec
   * @default '/openapi.json'
   */
  specPath?: string;

  /**
   * OpenAPI specification object
   */
  spec?: OpenAPISpec;

  /**
   * Page title
   * @default 'API Documentation'
   */
  title?: string;

  /**
   * Favicon URL
   */
  favicon?: string;

  /**
   * Theme options
   */
  theme?: {
    colors?: {
      primary?: {
        main?: string;
      };
    };
    typography?: {
      fontSize?: string;
      fontFamily?: string;
      headings?: {
        fontFamily?: string;
      };
      code?: {
        fontFamily?: string;
      };
    };
    sidebar?: {
      backgroundColor?: string;
      textColor?: string;
    };
    rightPanel?: {
      backgroundColor?: string;
    };
  };

  /**
   * Expand responses by default
   */
  expandResponses?: string;

  /**
   * Hide hostname in examples
   */
  hideHostname?: boolean;

  /**
   * Hide download button
   */
  hideDownloadButton?: boolean;

  /**
   * Hide loading screen
   */
  hideLoading?: boolean;

  /**
   * Native scrolling
   */
  nativeScrollbars?: boolean;

  /**
   * Path in docs to scroll to
   */
  scrollYOffset?: number;
}

/**
 * Generate ReDoc HTML page
 */
function generateReDocHTML(options: Required<ReDocOptions>): string {
  const _themeJson = options.theme ? JSON.stringify(options.theme) : '{}';
  void _themeJson; // Reserved for future use

  const redocOptions: Record<string, unknown> = {
    expandResponses: options.expandResponses,
    hideHostname: options.hideHostname,
    hideDownloadButton: options.hideDownloadButton,
    hideLoading: options.hideLoading,
    nativeScrollbars: options.nativeScrollbars,
    scrollYOffset: options.scrollYOffset,
    theme: options.theme,
  };

  // Remove undefined values
  Object.keys(redocOptions).forEach((key) => {
    if (redocOptions[key] === undefined) {
      delete redocOptions[key];
    }
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  ${options.favicon ? `<link rel="icon" type="image/png" href="${options.favicon}">` : ''}
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="redoc-container" data-url="${options.specPath}"></div>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  <script>
    Redoc.init(
      ${options.spec ? JSON.stringify(options.spec) : `'${options.specPath}'`},
      ${JSON.stringify(redocOptions)},
      document.getElementById('redoc-container')
    );
  </script>
</body>
</html>`;
}

/**
 * Create ReDoc middleware for Vexor
 */
export function reDoc(options: ReDocOptions = {}) {
  const fullOptions: Required<ReDocOptions> = {
    path: '/redoc',
    specPath: '/openapi.json',
    spec: undefined as any,
    title: 'API Documentation',
    favicon: '',
    theme: {},
    expandResponses: '',
    hideHostname: false,
    hideDownloadButton: false,
    hideLoading: false,
    nativeScrollbars: false,
    scrollYOffset: 0,
    ...options,
  };

  return async (ctx: VexorContext): Promise<Response | void> => {
    if (ctx.path === fullOptions.path || ctx.path === fullOptions.path + '/') {
      const html = generateReDocHTML(fullOptions);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return;
  };
}

/**
 * Register ReDoc routes on a Vexor app
 */
export function registerReDoc(app: Vexor, options: ReDocOptions = {}): void {
  const path = options.path || '/redoc';
  const specPath = options.specPath || '/openapi.json';

  const fullOptions: Required<ReDocOptions> = {
    path,
    specPath,
    spec: undefined as any,
    title: 'API Documentation',
    favicon: '',
    theme: {},
    expandResponses: '',
    hideHostname: false,
    hideDownloadButton: false,
    hideLoading: false,
    nativeScrollbars: false,
    scrollYOffset: 0,
    ...options,
  };

  app.get(path, async (_ctx) => {
    const html = generateReDocHTML(fullOptions);
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  });

  if (options.spec) {
    app.get(specPath, async (ctx) => {
      return ctx.json(options.spec);
    });
  }
}

// ============================================================================
// Scalar Alternative (Modern API Reference)
// ============================================================================

export interface ScalarOptions {
  /**
   * Path to serve Scalar
   * @default '/scalar'
   */
  path?: string;

  /**
   * Path to OpenAPI spec
   * @default '/openapi.json'
   */
  specPath?: string;

  /**
   * OpenAPI specification object
   */
  spec?: OpenAPISpec;

  /**
   * Page title
   * @default 'API Reference'
   */
  title?: string;

  /**
   * Theme
   * @default 'purple'
   */
  theme?: 'alternate' | 'default' | 'moon' | 'purple' | 'solarized' | 'bluePlanet' | 'saturn' | 'kepler' | 'mars' | 'deepSpace' | 'none';

  /**
   * Dark mode
   */
  darkMode?: boolean;

  /**
   * Hide models section
   */
  hideModels?: boolean;

  /**
   * Hide download button
   */
  hideDownloadButton?: boolean;

  /**
   * Show sidebar
   */
  showSidebar?: boolean;

  /**
   * Custom CSS
   */
  customCss?: string;

  /**
   * Proxy URL for CORS issues
   */
  proxyUrl?: string;

  /**
   * Default HTTP client
   */
  defaultHttpClient?: {
    targetKey: string;
    clientKey: string;
  };
}

/**
 * Generate Scalar HTML page
 */
function generateScalarHTML(options: Required<ScalarOptions>): string {
  const configOptions: Record<string, unknown> = {
    theme: options.theme,
    darkMode: options.darkMode,
    hideModels: options.hideModels,
    hideDownloadButton: options.hideDownloadButton,
    showSidebar: options.showSidebar,
    proxyUrl: options.proxyUrl,
    defaultHttpClient: options.defaultHttpClient,
  };

  // Remove undefined
  Object.keys(configOptions).forEach((key) => {
    if (configOptions[key] === undefined) {
      delete configOptions[key];
    }
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    ${options.customCss || ''}
  </style>
</head>
<body>
  <script
    id="api-reference"
    data-url="${options.specPath}"
    ${options.spec ? `data-spec='${JSON.stringify(options.spec)}'` : ''}
    data-configuration='${JSON.stringify(configOptions)}'
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;
}

/**
 * Create Scalar middleware for Vexor
 */
export function scalar(options: ScalarOptions = {}) {
  const fullOptions: Required<ScalarOptions> = {
    path: '/scalar',
    specPath: '/openapi.json',
    spec: undefined as any,
    title: 'API Reference',
    theme: 'purple',
    darkMode: false,
    hideModels: false,
    hideDownloadButton: false,
    showSidebar: true,
    customCss: '',
    proxyUrl: '',
    defaultHttpClient: undefined as any,
    ...options,
  };

  return async (ctx: VexorContext): Promise<Response | void> => {
    if (ctx.path === fullOptions.path || ctx.path === fullOptions.path + '/') {
      const html = generateScalarHTML(fullOptions);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return;
  };
}

/**
 * Register Scalar routes on a Vexor app
 */
export function registerScalar(app: Vexor, options: ScalarOptions = {}): void {
  const path = options.path || '/scalar';
  const specPath = options.specPath || '/openapi.json';

  const fullOptions: Required<ScalarOptions> = {
    path,
    specPath,
    spec: undefined as any,
    title: 'API Reference',
    theme: 'purple',
    darkMode: false,
    hideModels: false,
    hideDownloadButton: false,
    showSidebar: true,
    customCss: '',
    proxyUrl: '',
    defaultHttpClient: undefined as any,
    ...options,
  };

  app.get(path, async (_ctx) => {
    const html = generateScalarHTML(fullOptions);
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  });

  if (options.spec) {
    app.get(specPath, async (ctx) => {
      return ctx.json(options.spec);
    });
  }
}
