import { getAuth, User } from "firebase/auth"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
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
import { LayoutDashboard, ListChecks, Tags, Settings, LogOut, ChevronRight, Menu, X, Code } from 'lucide-react'

interface SideNavigationProps {
  className?: string
}

const SideNavigation: React.FC<SideNavigationProps> = ({ className = "" }) => {
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const location = useLocation()
  const auth = getAuth();
  const navigate = useNavigate();

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
    }
  })

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

  const navItems = [
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
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[140px]">
                      {user.displayName || user.email}
                    </span>
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
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu size={20} />
      </Button>

      {/* Mobile navigation */}
      {mobileNav}

      {/* Desktop navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col border-r border-border bg-card/80 backdrop-blur-sm transition-all duration-300 ${
          expanded ? "w-64" : "w-20"
        } ${className}`}
      >
        <div
          className={`flex items-center ${
            expanded ? "justify-between" : "justify-center"
          } p-4 border-b border-border`}
        >
          {expanded ? (
            <>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-75"></div>
                  <div className="relative bg-background p-1.5 rounded-full">
                    <Code size={20} className="text-primary" />
                  </div>
                </div>
                <span className="font-bold">CodeQuest</span>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                <ChevronRight size={18} />
              </Button>
            </>
          ) : (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-75"></div>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="relative h-8 w-8">
                <Code size={20} className="text-primary" />
              </Button>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                {expanded ? (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={`flex items-center justify-center h-10 w-full rounded-md transition-colors ${
                            isActive(item.path)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {item.icon}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={`p-4 border-t border-border ${expanded ? "" : "flex justify-center"}`}>
          {user ? (
            expanded ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {user.displayName || user.email}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user.displayName ? user.email : ""}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <ChevronRight size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {user.displayName
                                ? user.displayName.charAt(0).toUpperCase()
                                : user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          <div className="flex flex-col">
                            <span>{user.displayName || user.email}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.displayName ? user.email : ""}
                            </span>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent side="right">Account</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          ) : expanded ? (
            <div className="flex gap-2">
              <Button asChild className="flex-1">
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
                  <Button asChild variant="outline" size="icon">
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
      </aside>
    </>
  )
}

export default SideNavigation
