import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Header from "@/components/Header";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <p>Loading...</p>;
  }


  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 mt-16">
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
              <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUpPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
