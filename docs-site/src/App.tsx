import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import GettingStartedPage from './pages/GettingStartedPage';
import CorePage from './pages/CorePage';
import ORMPage from './pages/ORMPage';
import MiddlewarePage from './pages/MiddlewarePage';
import RealtimePage from './pages/RealtimePage';
import DeploymentPage from './pages/DeploymentPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="docs/getting-started" element={<GettingStartedPage />} />
        <Route path="docs/core" element={<CorePage />} />
        <Route path="docs/orm" element={<ORMPage />} />
        <Route path="docs/middleware" element={<MiddlewarePage />} />
        <Route path="docs/realtime" element={<RealtimePage />} />
        <Route path="docs/deployment" element={<DeploymentPage />} />
      </Route>
    </Routes>
  );
}
