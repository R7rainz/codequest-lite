"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ModeToggle } from "./mode-toggle"
import { motion } from "framer-motion"
import { Code } from "lucide-react"

export default function Header() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.pathname)

  useEffect(() => {
    setActiveTab(location.pathname === "/about" ? "/about" : "/")
  }, [location])

  return (
    <header className="fixed top-0 left-0 w-full z-50 py-6">
      {/* Floating header card */}
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          {/* Header content */}
          <div className="relative flex items-center justify-between bg-background/60 backdrop-blur-xl rounded-xl p-2 shadow-lg border border-border/40">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 px-3 py-1 rounded-lg transition-colors hover:bg-primary/5">
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-70"></div>
                <div className="relative bg-background/80 backdrop-blur-sm p-1.5 rounded-full">
                  <Code size={18} className="text-primary" />
                </div>
              </div>
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                CodeQuest
              </span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center">
              {/* Custom tab navigation */}
              <div className="relative mx-4 bg-muted/50 rounded-lg p-1 hidden sm:block">
                <div className="flex space-x-1 relative z-0">
                  {[
                    { path: "/", label: "Home" },
                    { path: "/about", label: "About" },
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeTab === item.path
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setActiveTab(item.path)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Animated background for active tab */}
                  <motion.div
                    className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md"
                    layoutId="tab-background"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    style={{
                      width: "50%",
                      left: activeTab === "/" ? "0%" : "50%",
                    }}
                  />
                </div>
              </div>

              {/* Mobile navigation */}
              <div className="sm:hidden flex space-x-1">
                {[
                  { path: "/", label: "Home" },
                  { path: "/about", label: "About" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === item.path
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Theme toggle */}
              <div className="ml-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

