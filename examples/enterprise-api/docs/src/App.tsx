import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { GettingStarted } from './pages/GettingStarted';
import { Configuration } from './pages/Configuration';
import { Authentication } from './pages/Authentication';
import { Users } from './pages/Users';
import { Products } from './pages/Products';
import { Database } from './pages/Database';
import { Security } from './pages/Security';
import { Testing } from './pages/Testing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="getting-started" element={<GettingStarted />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="authentication" element={<Authentication />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="database" element={<Database />} />
          <Route path="security" element={<Security />} />
          <Route path="testing" element={<Testing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
