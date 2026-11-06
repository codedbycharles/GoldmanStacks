import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NewQuotePage } from "./pages/NewQuotePage";
import { QuoteResultsPage } from "./pages/QuoteResultPage";
import { QuoteHistoryPage } from "./pages/QuoteHistoryPage";

function PlaceholderPage({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/quotes" element={<QuoteHistoryPage />} />

          <Route path="/quotes/new" element={<NewQuotePage />} />

          <Route path="/quotes/:id" element={<QuoteResultsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<PlaceholderPage title="Page not found" />} />
    </Routes>
  );
}

export default App;
