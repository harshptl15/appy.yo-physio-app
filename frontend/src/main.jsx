import React from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import './styles.css';

const rootElement = document.getElementById('react-root');

if (rootElement) {
  const page = document.body.dataset.page;
  const data = window.__PHYSIO_PAGE_DATA__ || {};

  const root = createRoot(rootElement);

  if (page === 'login') {
    root.render(<LoginPage />);
  } else if (page === 'register') {
    root.render(<RegisterPage />);
  } else if (page === 'dashboard') {
    root.render(<DashboardPage data={data} />);
  }
}
