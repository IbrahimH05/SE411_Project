import { Navigate, Route, Routes } from 'react-router-dom';

import { NavBar } from './components/NavBar';
import { AboutPage } from './pages/AboutPage';
import { AssetFormPage } from './pages/AssetFormPage';
import { AssetsPage } from './pages/AssetsPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/new" element={<AssetFormPage mode="create" />} />
          <Route path="/assets/:id/edit" element={<AssetFormPage mode="edit" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        AssetVault · SE411 Software Construction · Part 1 (frontend only)
      </footer>
    </div>
  );
}
