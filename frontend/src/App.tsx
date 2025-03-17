import Header from "@/components/Header"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"
import LoginPage from "./pages/LoginPage"
import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth"
import SignUpPage from "./pages/SignUpPage"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const auth = getAuth()

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe() // Cleanup listener on unmount
  });

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 mt-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Routes>
            {user ? (
              <div className="fixed bottom-4 right-4 bg-black p-2 rounded">
                <p>Logged in as: {user.email}</p>
                <button onClick={() => signOut(auth)}>Logout</button>
              </div>
            ) : (
              <p className="text-center mt-4">Not logged in</p>
            )}
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
