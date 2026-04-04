import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#333",
          fontFamily: "monospace",
          fontSize: "0.8rem",
        }}
      >
        // initializing...
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
