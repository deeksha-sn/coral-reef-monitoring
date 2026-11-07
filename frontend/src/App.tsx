import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { ImageAssessment } from './pages/ImageAssessment';
import { GeographicalMonitoring } from './pages/GeographicalMonitoring';
import { DiseaseAnalytics } from './pages/DiseaseAnalytics';
import { HistoricalComparison } from './pages/HistoricalComparison';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { DatasetManagement } from './pages/DatasetManagement';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<OverviewDashboard />} />
              <Route path="assessment" element={<ImageAssessment />} />
              <Route path="geographical" element={<GeographicalMonitoring />} />
              <Route path="analytics" element={<DiseaseAnalytics />} />
              <Route path="comparison" element={<HistoricalComparison />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="dataset" element={<DatasetManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
