import Header from "@/components/Header"
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 mt-16">
          <Routes>
            <Route path = "/" element={<HomePage/>} />
            <Route path = "/about" element={<AboutPage/>} />
          </Routes>
        </main>
      </div>
    </Router>
    </ThemeProvider>
  )
}

export default App
