import type React from "react"
import { getAuth, type User } from "firebase/auth"
import { useState, useEffect, useRef } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { signOut } from "firebase/auth"
import {
  LayoutDashboard,
  ListChecks,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
  Code,
  UserIcon,
  ChevronRight,
  Info,
} from "lucide-react"
import { motion } from "framer-motion"

interface SideNavigationProps {
  className?: string
}

const SideNavBar: React.FC<SideNavigationProps> = ({ className = "" }) => {
  const [expanded, setExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const location = useLocation()
  const auth = getAuth()
  const navigate = useNavigate()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setExpanded(false)
        setIsMobile(true)
      } else {
        setIsMobile(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Firebase auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      unsubscribe()
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [auth])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setExpanded(!expanded)
    }
  }

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    if (!isMobile) {
      setExpanded(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile && !isDropdownOpen) {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false)
      }, 300) // Small delay to prevent flickering
    }
  }

  const handleDropdownOpenChange = (open: boolean) => {
    setIsDropdownOpen(open)

    // If dropdown is closing and mouse is not over sidebar, start collapse timer
    if (!open && !sidebarRef.current?.matches(":hover")) {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false)
      }, 300)
    }
  }

  const navItems = [
    { name: "About", icon: <Info size={20} />, path: "/about" },
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Tracker", icon: <ListChecks size={20} />, path: "/tracker" },
    { name: "Tags", icon: <Tags size={20} />, path: "/tags" },
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ]

  const isActive = (path: string) => location.pathname === path

  // Mobile navigation overlay
  const mobileNav = (
    <div
      className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
        mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-72 bg-card border-r border-border shadow-xl transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-75"></div>
                <div className="relative bg-background p-1.5 rounded-full">
                  <Code size={20} className="text-primary" />
                </div>
              </div>
              <span className="font-bold text-lg">CodeQuest</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X size={20} />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[140px]">{user.displayName || user.email}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user.displayName ? user.email : ""}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40 lg:hidden" onClick={toggleSidebar}>
        <Menu size={20} />
      </Button>

      {/* Mobile navigation */}
      {mobileNav}

      {/* Desktop navigation */}
      <motion.aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{ width: expanded ? "240px" : "72px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col border-r border-border/40 bg-gradient-to-b from-card/90 to-card/70 backdrop-blur-sm shadow-md${className}`}
      >
        <div className="flex items-center justify-center p-4 border-b border-border/40">
          <div className="relative flex items-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-75"></div>
            <div className="relative bg-background p-2 rounded-full">
              <Code size={24} className="text-primary" />
            </div>
            <motion.span
              initial={false}
              animate={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 font-bold text-lg overflow-hidden whitespace-nowrap"
            >
              CodeQuest
            </motion.span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 overflow-hidden">
          <div className="px-3 mb-6">
            <motion.div
              initial={false}
              animate={{ opacity: expanded ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2"
            >
              Main
            </motion.div>
            <ul className="space-y-1">
              {navItems.slice(0, 1).map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <motion.span
                      initial={false}
                      animate={{ opacity: expanded ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-3">
            <motion.div
              initial={false}
              animate={{ opacity: expanded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2"
            >
              Workspace
            </motion.div>
            <ul className="space-y-1">
              {navItems.slice(1).map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <motion.span
                      initial={false}
                      animate={{ opacity: expanded ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                    {item.name === "Tracker" && expanded}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="p-3 mt-auto border-t border-border/40">
          {user ? (
            <div
              className={`flex items-center ${expanded ? "justify-between" : "justify-center"} p-2 rounded-lg transition-colors hover:bg-muted`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="flex-shrink-0">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  initial={false}
                  animate={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col min-w-0 overflow-hidden"
                >
                  <span className="text-sm font-medium truncate">{user.displayName || user.email}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.displayName ? user.email : ""}</span>
                </motion.div>
              </div>
              {expanded && (
                <DropdownMenu onOpenChange={handleDropdownOpenChange}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-2">
                      <ChevronRight size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={5} className="z-50">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <NavLink to="/profile" className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ) : expanded ? (
            <div className="flex gap-2">
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="outline" size="icon" className="w-full">
                    <Link to="/login">
                      <LogOut size={18} />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Login</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </motion.aside>
    </>
  )
}

export default SideNavBar

