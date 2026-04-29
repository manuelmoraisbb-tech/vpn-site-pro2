import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './admin/AuthContext';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import AdminUpload from './admin/UploadFile';
import AdminFiles from './admin/FilesList';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="upload" element={<AdminUpload />} />
            <Route path="files" element={<AdminFiles />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
