import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

// Getting Started (eagerly loaded - most visited)
import GettingStarted from './pages/GettingStarted';
import Installation from './pages/Installation';
import QuickStart from './pages/QuickStart';

// Core Concepts (eagerly loaded)
import CoreConcepts from './pages/CoreConcepts';
import Routing from './pages/Routing';
import Middleware from './pages/Middleware';
import Context from './pages/Context';
import Validation from './pages/Validation';

// API Reference (eagerly loaded)
import ApiReference from './pages/ApiReference';
import VexorClass from './pages/api/VexorClass';
import ContextApi from './pages/api/ContextApi';
import RouterApi from './pages/api/RouterApi';
import SchemaApi from './pages/api/SchemaApi';

// ORM (eagerly loaded)
import OrmOverview from './pages/orm/OrmOverview';
import OrmSchema from './pages/orm/OrmSchema';
import OrmQueries from './pages/orm/OrmQueries';
import OrmMigrations from './pages/orm/OrmMigrations';
import OrmRelations from './pages/orm/OrmRelations';

// CLI (eagerly loaded)
import CliOverview from './pages/cli/CliOverview';
import CliCommands from './pages/cli/CliCommands';

// Middleware section (lazy)
const RateLimiting = lazy(() => import('./pages/middleware/RateLimiting'));
const Cors = lazy(() => import('./pages/middleware/Cors'));
const Compression = lazy(() => import('./pages/middleware/Compression'));
const Upload = lazy(() => import('./pages/middleware/Upload'));
const Health = lazy(() => import('./pages/middleware/Health'));
const Versioning = lazy(() => import('./pages/middleware/Versioning'));

// Infrastructure section (lazy)
const Caching = lazy(() => import('./pages/infrastructure/Caching'));
const Logging = lazy(() => import('./pages/infrastructure/Logging'));
const DependencyInjection = lazy(() => import('./pages/infrastructure/DependencyInjection'));
const Plugins = lazy(() => import('./pages/infrastructure/Plugins'));
const Config = lazy(() => import('./pages/infrastructure/Config'));

// Auth & Security section (lazy)
const Authentication = lazy(() => import('./pages/auth/Authentication'));
const Sessions = lazy(() => import('./pages/auth/Sessions'));
const OAuth = lazy(() => import('./pages/auth/OAuth'));
const Security = lazy(() => import('./pages/auth/Security'));

// Observability section (lazy)
const Metrics = lazy(() => import('./pages/observability/Metrics'));
const Tracing = lazy(() => import('./pages/observability/Tracing'));
const OpenAPI = lazy(() => import('./pages/observability/OpenAPI'));

// ORM extensions (lazy)
const OrmPooling = lazy(() => import('./pages/orm/OrmPooling'));
const OrmSoftDeletes = lazy(() => import('./pages/orm/OrmSoftDeletes'));
const OrmSeeders = lazy(() => import('./pages/orm/OrmSeeders'));

// Real-Time section (lazy)
const SSE = lazy(() => import('./pages/realtime/SSE'));
const WebSocket = lazy(() => import('./pages/realtime/WebSocket'));
const PubSub = lazy(() => import('./pages/realtime/PubSub'));

// Advanced section (lazy)
const Adapters = lazy(() => import('./pages/advanced/Adapters'));
const CircuitBreaker = lazy(() => import('./pages/advanced/CircuitBreaker'));
const Retry = lazy(() => import('./pages/advanced/Retry'));
const Serialization = lazy(() => import('./pages/advanced/Serialization'));
const ErrorHandling = lazy(() => import('./pages/advanced/ErrorHandling'));
const Deployment = lazy(() => import('./pages/advanced/Deployment'));
const Testing = lazy(() => import('./pages/advanced/Testing'));
const Migration = lazy(() => import('./pages/advanced/Migration'));
const Performance = lazy(() => import('./pages/advanced/Performance'));

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        {/* Getting Started */}
        <Route path="getting-started" element={<GettingStarted />} />
        <Route path="installation" element={<Installation />} />
        <Route path="quick-start" element={<QuickStart />} />

        {/* Core Concepts */}
        <Route path="core-concepts" element={<CoreConcepts />} />
        <Route path="routing" element={<Routing />} />
        <Route path="middleware" element={<Middleware />} />
        <Route path="context" element={<Context />} />
        <Route path="validation" element={<Validation />} />

        {/* Middleware */}
        <Route path="middleware/rate-limiting" element={<LazyPage><RateLimiting /></LazyPage>} />
        <Route path="middleware/cors" element={<LazyPage><Cors /></LazyPage>} />
        <Route path="middleware/compression" element={<LazyPage><Compression /></LazyPage>} />
        <Route path="middleware/upload" element={<LazyPage><Upload /></LazyPage>} />
        <Route path="middleware/health" element={<LazyPage><Health /></LazyPage>} />
        <Route path="middleware/versioning" element={<LazyPage><Versioning /></LazyPage>} />

        {/* Infrastructure */}
        <Route path="infrastructure/caching" element={<LazyPage><Caching /></LazyPage>} />
        <Route path="infrastructure/logging" element={<LazyPage><Logging /></LazyPage>} />
        <Route path="infrastructure/dependency-injection" element={<LazyPage><DependencyInjection /></LazyPage>} />
        <Route path="infrastructure/plugins" element={<LazyPage><Plugins /></LazyPage>} />
        <Route path="infrastructure/config" element={<LazyPage><Config /></LazyPage>} />

        {/* Auth & Security */}
        <Route path="auth/authentication" element={<LazyPage><Authentication /></LazyPage>} />
        <Route path="auth/sessions" element={<LazyPage><Sessions /></LazyPage>} />
        <Route path="auth/oauth" element={<LazyPage><OAuth /></LazyPage>} />
        <Route path="auth/security" element={<LazyPage><Security /></LazyPage>} />

        {/* Observability */}
        <Route path="observability/metrics" element={<LazyPage><Metrics /></LazyPage>} />
        <Route path="observability/tracing" element={<LazyPage><Tracing /></LazyPage>} />
        <Route path="observability/openapi" element={<LazyPage><OpenAPI /></LazyPage>} />

        {/* API Reference */}
        <Route path="api" element={<ApiReference />} />
        <Route path="api/vexor" element={<VexorClass />} />
        <Route path="api/context" element={<ContextApi />} />
        <Route path="api/router" element={<RouterApi />} />
        <Route path="api/schema" element={<SchemaApi />} />

        {/* ORM */}
        <Route path="orm" element={<OrmOverview />} />
        <Route path="orm/schema" element={<OrmSchema />} />
        <Route path="orm/queries" element={<OrmQueries />} />
        <Route path="orm/migrations" element={<OrmMigrations />} />
        <Route path="orm/relations" element={<OrmRelations />} />
        <Route path="orm/pooling" element={<LazyPage><OrmPooling /></LazyPage>} />
        <Route path="orm/soft-deletes" element={<LazyPage><OrmSoftDeletes /></LazyPage>} />
        <Route path="orm/seeders" element={<LazyPage><OrmSeeders /></LazyPage>} />

        {/* Real-Time */}
        <Route path="realtime/sse" element={<LazyPage><SSE /></LazyPage>} />
        <Route path="realtime/websocket" element={<LazyPage><WebSocket /></LazyPage>} />
        <Route path="realtime/pubsub" element={<LazyPage><PubSub /></LazyPage>} />

        {/* CLI */}
        <Route path="cli" element={<CliOverview />} />
        <Route path="cli/commands" element={<CliCommands />} />

        {/* Advanced */}
        <Route path="advanced/adapters" element={<LazyPage><Adapters /></LazyPage>} />
        <Route path="advanced/circuit-breaker" element={<LazyPage><CircuitBreaker /></LazyPage>} />
        <Route path="advanced/retry" element={<LazyPage><Retry /></LazyPage>} />
        <Route path="advanced/serialization" element={<LazyPage><Serialization /></LazyPage>} />
        <Route path="advanced/error-handling" element={<LazyPage><ErrorHandling /></LazyPage>} />
        <Route path="advanced/deployment" element={<LazyPage><Deployment /></LazyPage>} />
        <Route path="advanced/testing" element={<LazyPage><Testing /></LazyPage>} />
        <Route path="advanced/migration" element={<LazyPage><Migration /></LazyPage>} />
        <Route path="advanced/performance" element={<LazyPage><Performance /></LazyPage>} />

        {/* Redirects for old routes */}
        <Route path="guides" element={<Navigate to="/advanced/adapters" replace />} />
        <Route path="guides/authentication" element={<Navigate to="/auth/authentication" replace />} />
        <Route path="guides/realtime" element={<Navigate to="/realtime/sse" replace />} />
        <Route path="guides/error-handling" element={<Navigate to="/advanced/error-handling" replace />} />
        <Route path="guides/configuration" element={<Navigate to="/infrastructure/config" replace />} />
        <Route path="guides/deployment" element={<Navigate to="/advanced/deployment" replace />} />
        <Route path="guides/testing" element={<Navigate to="/advanced/testing" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
