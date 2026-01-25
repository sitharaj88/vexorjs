import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import GettingStarted from './pages/GettingStarted';
import Installation from './pages/Installation';
import QuickStart from './pages/QuickStart';
import CoreConcepts from './pages/CoreConcepts';
import Routing from './pages/Routing';
import Middleware from './pages/Middleware';
import Context from './pages/Context';
import Validation from './pages/Validation';
import ApiReference from './pages/ApiReference';
import VexorClass from './pages/api/VexorClass';
import ContextApi from './pages/api/ContextApi';
import RouterApi from './pages/api/RouterApi';
import SchemaApi from './pages/api/SchemaApi';
import OrmOverview from './pages/orm/OrmOverview';
import OrmSchema from './pages/orm/OrmSchema';
import OrmQueries from './pages/orm/OrmQueries';
import OrmMigrations from './pages/orm/OrmMigrations';
import OrmRelations from './pages/orm/OrmRelations';
import CliOverview from './pages/cli/CliOverview';
import CliCommands from './pages/cli/CliCommands';
import Guides from './pages/Guides';
import Authentication from './pages/guides/Authentication';
import RealTime from './pages/guides/RealTime';
import Deployment from './pages/guides/Deployment';
import Testing from './pages/guides/Testing';
import ErrorHandling from './pages/guides/ErrorHandling';
import Configuration from './pages/guides/Configuration';

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

        {/* CLI */}
        <Route path="cli" element={<CliOverview />} />
        <Route path="cli/commands" element={<CliCommands />} />

        {/* Guides */}
        <Route path="guides" element={<Guides />} />
        <Route path="guides/authentication" element={<Authentication />} />
        <Route path="guides/realtime" element={<RealTime />} />
        <Route path="guides/deployment" element={<Deployment />} />
        <Route path="guides/testing" element={<Testing />} />
        <Route path="guides/error-handling" element={<ErrorHandling />} />
        <Route path="guides/configuration" element={<Configuration />} />
      </Route>
    </Routes>
  );
}

export default App;
