import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthLockProvider } from "./context/AuthLockContext";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RecordPage } from "./pages/RecordPage";
import { TimelinePage } from "./pages/TimelinePage";
import { EntryDetailPage } from "./pages/EntryDetailPage";
import { SearchPage } from "./pages/SearchPage";
import { InsightsPage } from "./pages/InsightsPage";
import { SettingsPage } from "./pages/SettingsPage";

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthLockProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Authenticated / Protected Journal Space */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="record" element={<RecordPage />} />
              <Route path="timeline" element={<TimelinePage />} />
              <Route path="entry/:id" element={<EntryDetailPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthLockProvider>
    </ThemeProvider>
  );
};

export default App;
