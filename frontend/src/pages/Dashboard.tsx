import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Code,
  ExternalLink,
  Filter,
  ListChecks,
  MoreHorizontal,
  PieChartIcon,
  Plus,
  Tag,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react"
import { format, startOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { motion } from "framer-motion"
import SideNavBar from "@/components/SideNavBar"
import { auth, db } from "@/config/config"
import { collection, getDocs } from "firebase/firestore"

// Types
interface Problem {
  id: string
  name: string
  link: string
  tags: string[]
  completed: boolean
  difficulty: "Easy" | "Medium" | "Hard"
  platform: string
  createdAt: Date
}

interface TagType {
  id: string
  name: string
  color: string
}

// Interactive background component
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; color: string }[] = []
    const particleCount = 50

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.1})`, // Indigo with random opacity
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })

      // Draw connections between nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 - distance / 1000})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10 h-full w-full" />
}

// Helper components
const StatCard = ({
  title,
  value,
  icon,
  trend,
  description,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; label: string }
  description?: string
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p
            className={`text-xs ${trend.value > 0 ? "text-green-500" : trend.value < 0 ? "text-red-500" : "text-muted-foreground"} flex items-center`}
          >
            {trend.value > 0 ? (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            ) : trend.value < 0 ? (
              <X className="mr-1 h-3 w-3" />
            ) : null}
            {trend.value > 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

const ProblemItem = ({ problem, tags }: { problem: Problem; tags: TagType[] }) => {
  const problemTags = tags.filter((tag) => problem.tags.includes(tag.id))

  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
      <div
        className={`h-2 w-2 mt-2 rounded-full ${
          problem.difficulty === "Easy"
            ? "bg-green-500"
            : problem.difficulty === "Medium"
              ? "bg-yellow-500"
              : "bg-red-500"
        }`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{problem.name}</h3>
          {problem.link && (
            <a
              href={problem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{problem.platform}</span>
          <span>•</span>
          <span>{problem.difficulty}</span>
          <span>•</span>
          <span className="flex items-center">
            <Calendar size={12} className="mr-1" />
            {format(problem.createdAt, "MMM d, yyyy")}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {problemTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className={`text-xs ${tag.color} bg-opacity-15`}>
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

// Dashboard Page Component
const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // State for all data
  const [problems, setProblems] = useState<Problem[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [difficultyData, setDifficultyData] = useState<{ name: string; value: number; color: string }[]>([])
  const [platformData, setPlatformData] = useState<{ name: string; value: number; color: string }[]>([])
  const [tagDistribution, setTagDistribution] = useState<{ name: string; count: number; color: string }[]>([])
  const [weeklyData, setWeeklyData] = useState<{ name: string; completed: number; total: number; rate: number }[]>([])
  const [completionRate, setCompletionRate] = useState(0)
  const [streak, setStreak] = useState(0)
  const [avgDifficulty, setAvgDifficulty] = useState("Medium")
  const [trendData, setTrendData] = useState({ problems: 0, completion: 0 })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Colors for charts - ensure distinct colors for platforms
  const DIFFICULTY_COLORS = {
    Easy: "#22C55E",
    Medium: "#F59E0B",
    Hard: "#EF4444",
  }

  const PLATFORM_COLORS: Record<string, string> = {
    LeetCode: "#FFA116", // LeetCode orange
    CodeForces: "#1E88E5", // Blue
    CodeChef: "#5B4638", // Brown
    AtCoder: "#222222", // Black
    HackerRank: "#2EC866", // Green
    AlgoExpert: "#626EE3", // Purple
    GeeksforGeeks: "#2F8D46", // Green
    Naukri: "#0056D2", // Blue
    InterviewBit: "#FF5722", // Orange
    TopCoder: "#F65314", // Red
    SPOJ: "#337AB7", // Blue
    Codewars: "#B1361E", // Red
    ProjectEuler: "#00A2E8", // Blue
    UVa: "#9C27B0", // Purple
    Kattis: "#FFCA28", // Yellow
    CodeSignal: "#35C4F0", // Light Blue
  }

  // Generate a color for platforms not in our predefined list
  const getColorForPlatform = (platform: string): string => {
    if (PLATFORM_COLORS[platform]) {
      return PLATFORM_COLORS[platform]
    }

    // Generate a deterministic color based on the platform name
    let hash = 0
    for (let i = 0; i < platform.length; i++) {
      hash = platform.charCodeAt(i) + ((hash << 5) - hash)
    }

    let color = "#"
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      color += ("00" + value.toString(16)).substr(-2)
    }

    return color
  }

  // Colors for tag chart
  const TAG_COLORS = [
    "#6366F1",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#8B5CF6",
    "#EC4899",
    "#F97316",
    "#14B8A6",
    "#8B5CF6",
    "#64748B",
    "#0EA5E9",
    "#84CC16",
    "#A855F7",
    "#F43F5E",
  ]

  // Filter problems based on time range
  const filterProblemsByTimeRange = (problems: Problem[], range: string): Problem[] => {
    const now = new Date()

    if (range === "week") {
      const weekStart = startOfWeek(now)
      return problems.filter((p) => p.createdAt >= weekStart)
    } else if (range === "month") {
      const monthStart = startOfMonth(now)
      return problems.filter((p) => p.createdAt >= monthStart)
    }

    return problems // "all" time range
  }

  // Calculate weekly progress data
  type WeekStats = { completed: number; total: number }
  type WeeklyData = { name: string; completed: number; total: number; rate: number }[]

  const calculateWeeklyData = (problems: Problem[]): WeeklyData => {
    const weeks: Record<string, WeekStats> = {}

    // Group by week
    problems.forEach((problem) => {
      const weekKey = format(problem.createdAt, "yyyy-ww")
      if (!weeks[weekKey]) {
        weeks[weekKey] = { completed: 0, total: 0 }
      }

      weeks[weekKey].total++
      if (problem.completed) {
        weeks[weekKey].completed++
      }
    })

    // Convert to array and sort by date
    return Object.entries(weeks)
      .map(([weekKey, data]) => {
        const [year, week] = weekKey.split("-")
        return {
          name: `Week ${week}`,
          completed: data.completed,
          total: data.total,
          rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-8) // Last 8 weeks
  }

  // Calculate streak
  const calculateStreak = (problems: Problem[]): number => {
    // Sort problems by date (newest first)
    const sortedProblems = [...problems]
      .filter((p) => p.completed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    if (sortedProblems.length === 0) return 0

    // Check if there's a problem completed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const latestDate = new Date(sortedProblems[0].createdAt)
    latestDate.setHours(0, 0, 0, 0)

    // If the latest problem is not from today, streak is 0
    if (latestDate.getTime() !== today.getTime()) return 0

    // Count consecutive days
    let streak = 1
    let currentDate = today

    for (let i = 1; i < sortedProblems.length; i++) {
      const prevDay = new Date(currentDate)
      prevDay.setDate(prevDay.getDate() - 1)

      const problemDate = new Date(sortedProblems[i].createdAt)
      problemDate.setHours(0, 0, 0, 0)

      if (problemDate.getTime() === prevDay.getTime()) {
        streak++
        currentDate = prevDay
      } else if (problemDate.getTime() < prevDay.getTime()) {
        // We've found a gap, so stop counting
        break
      }
    }

    return streak
  }

  // Calculate average difficulty
  const calculateAvgDifficulty = (problems: Problem[]): string => {
    if (problems.length === 0) return "N/A"

    const difficultyScores = {
      Easy: 1,
      Medium: 2,
      Hard: 3,
    }

    const totalScore = problems.reduce((sum, problem) => {
      return sum + difficultyScores[problem.difficulty]
    }, 0)

    const avgScore = totalScore / problems.length

    if (avgScore <= 1.33) return "Easy"
    if (avgScore <= 2.33) return "Medium"
    return "Hard"
  }

  // Calculate trend data (comparing current month to previous month)
  const calculateTrendData = (problems: Problem[]): { problems: number; completion: number } => {
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1))
    const prevMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1))

    const currentMonthProblems = problems.filter((p) => p.createdAt >= currentMonthStart)
    const prevMonthProblems = problems.filter((p) => p.createdAt >= prevMonthStart && p.createdAt <= prevMonthEnd)

    const currentMonthCount = currentMonthProblems.length
    const prevMonthCount = prevMonthProblems.length

    const currentMonthCompleted = currentMonthProblems.filter((p) => p.completed).length
    const prevMonthCompleted = prevMonthProblems.filter((p) => p.completed).length

    const currentCompletionRate = currentMonthCount > 0 ? (currentMonthCompleted / currentMonthCount) * 100 : 0
    const prevCompletionRate = prevMonthCount > 0 ? (prevMonthCompleted / prevMonthCount) * 100 : 0

    // Calculate percentage change
    const problemsChange =
      prevMonthCount > 0 ? Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100) : 0

    const completionChange =
      prevCompletionRate > 0 ? Math.round(((currentCompletionRate - prevCompletionRate) / prevCompletionRate) * 100) : 0

    return {
      problems: problemsChange,
      completion: completionChange,
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const user = auth.currentUser

      if (!user) {
        console.log("No authenticated user")
        setIsLoading(false)
        return
      }

      try {
        // Fetch problems
        const problemsSnapshot = await getDocs(collection(db, `users/${user.uid}/problems`))
        const fetchedProblems: Problem[] = []

        problemsSnapshot.forEach((doc) => {
          const data = doc.data()
          fetchedProblems.push({
            id: doc.id,
            name: data.name || `Problem ${doc.id.substring(0, 5)}`,
            link: data.link || "",
            tags: data.tags || [],
            completed: data.completed || false,
            difficulty: data.difficulty || "Medium",
            platform: data.platform || "Unknown",
            createdAt: data.createdAt?.toDate() || new Date(),
          })
        })

        setProblems(fetchedProblems)

        // Fetch tags
        const tagsSnapshot = await getDocs(collection(db, `users/${user.uid}/tags`))
        const fetchedTags: TagType[] = []

        tagsSnapshot.forEach((doc) => {
          const data = doc.data()
          fetchedTags.push({
            id: doc.id,
            name: data.name || `Tag ${doc.id.substring(0, 5)}`,
            color: data.color || "bg-gray-500",
          })
        })

        setTags(fetchedTags)

        // Calculate difficulty distribution
        const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 }
        fetchedProblems.forEach((problem) => {
          if (difficultyCount[problem.difficulty] !== undefined) {
            difficultyCount[problem.difficulty]++
          }
        })

        setDifficultyData([
          { name: "Easy", value: difficultyCount.Easy, color: DIFFICULTY_COLORS.Easy },
          { name: "Medium", value: difficultyCount.Medium, color: DIFFICULTY_COLORS.Medium },
          { name: "Hard", value: difficultyCount.Hard, color: DIFFICULTY_COLORS.Hard },
        ])

        // Calculate platform distribution
        const platformCount: Record<string, number> = {}
        fetchedProblems.forEach((problem) => {
          if (problem.platform) {
            platformCount[problem.platform] = (platformCount[problem.platform] || 0) + 1
          }
        })

        setPlatformData(
          Object.entries(platformCount).map(([platform, count]) => ({
            name: platform,
            value: count,
            color: getColorForPlatform(platform),
          })),
        )

        // Calculate tag distribution
        const tagCount: Record<string, number> = {}
        fetchedProblems.forEach((problem) => {
          problem.tags.forEach((tagId) => {
            tagCount[tagId] = (tagCount[tagId] || 0) + 1
          })
        })

        const tagDistributionData = Object.entries(tagCount)
          .map(([tagId, count]) => {
            const tag = fetchedTags.find((t) => t.id === tagId)
            return {
              name: tag?.name || `Tag ${tagId}`,
              count,
              color: tag?.color.replace("bg-", "") || "gray-500",
            }
          })
          .sort((a, b) => b.count - a.count)

        setTagDistribution(tagDistributionData)

        // Calculate weekly data
        setWeeklyData(calculateWeeklyData(fetchedProblems))

        // Calculate completion rate
        const completedCount = fetchedProblems.filter((p) => p.completed).length
        setCompletionRate(fetchedProblems.length > 0 ? Math.round((completedCount / fetchedProblems.length) * 100) : 0)

        // Calculate streak
        setStreak(calculateStreak(fetchedProblems))

        // Calculate average difficulty
        setAvgDifficulty(calculateAvgDifficulty(fetchedProblems))

        // Calculate trend data
        setTrendData(calculateTrendData(fetchedProblems))
      } catch (error) {
        console.error("Error fetching data: ", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update data when time range changes
  useEffect(() => {
    if (problems.length > 0) {
      const filteredProblems = filterProblemsByTimeRange(problems, timeRange)

      // Recalculate stats based on filtered problems
      const completedCount = filteredProblems.filter((p) => p.completed).length
      setCompletionRate(filteredProblems.length > 0 ? Math.round((completedCount / filteredProblems.length) * 100) : 0)

      setWeeklyData(calculateWeeklyData(filteredProblems))
      setAvgDifficulty(calculateAvgDifficulty(filteredProblems))
    }
  }, [timeRange, problems])

  // Get incomplete problems
  const incompleteProblems = problems.filter((p) => !p.completed)

  return (
    <div>
      <SideNavBar />
      <div className="w-full flex-1 bg-background text-foreground overflow-hidden relative">
        <ParticleBackground />

        <div className="container mx-auto px-4 py-8">
          <div
            className={`transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Track your coding progress and insights</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={timeRange === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("week")}
                >
                  This Week
                </Button>
                <Button
                  variant={timeRange === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("month")}
                >
                  This Month
                </Button>
                <Button
                  variant={timeRange === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("all")}
                >
                  All Time
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading dashboard data...</p>
                </div>
              </div>
            ) : problems.length === 0 ? (
              <div className="text-center py-16">
                <Code size={48} className="mx-auto text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-2">No problems found</h2>
                <p className="text-muted-foreground mb-6">Start tracking your coding problems to see insights here.</p>
                <Button onClick={() => (window.location.href = "/tracker")}>
                  <Plus size={16} className="mr-1" />
                  Add Your First Problem
                </Button>
              </div>
            ) : (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <StatCard
                      title="Total Problems"
                      value={problems.length}
                      icon={<Code size={18} />}
                      trend={{ value: trendData.problems, label: "from last month" }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <StatCard
                      title="Completion Rate"
                      value={`${completionRate}%`}
                      icon={<CheckCircle2 size={18} />}
                      trend={{ value: trendData.completion, label: "from last month" }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <StatCard
                      title="Streak"
                      value={`${streak} day${streak !== 1 ? "s" : ""}`}
                      icon={<TrendingUp size={18} />}
                      description={
                        streak > 0 ? "Keep it up! You're on a roll." : "Solve a problem today to start a streak!"
                      }
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <StatCard
                      title="Avg. Difficulty"
                      value={avgDifficulty}
                      icon={<Trophy size={18} />}
                      description={`Most of your problems are ${avgDifficulty} difficulty.`}
                    />
                  </motion.div>
                </div>

                <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Platform Distribution */}
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <PieChartIcon size={18} className="text-primary" />
                            Platform Distribution
                          </CardTitle>
                          <CardDescription>Problems solved by platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            {platformData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={platformData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  >
                                    {platformData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => [`${value.toString()} problems`, "Count"]} />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">No platform data available</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Difficulty Distribution */}
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart className="text-primary" />
                            Difficulty Breakdown
                          </CardTitle>
                          <CardDescription>Problems by difficulty level</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            {difficultyData.some((d) => d.value > 0) ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={difficultyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip formatter={(value) => [`${value} problems`, "Count"]} />
                                  <Bar dataKey="value" name="Problems">
                                    {difficultyData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">No difficulty data available</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Tag Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tag size={18} className="text-primary" />
                          Tag Distribution
                        </CardTitle>
                        <CardDescription>Problems by tag category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          {tagDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={tagDistribution.slice(0, 10)} // Show top 10 tags
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip formatter={(value) => [`${value} problems`, "Count"]} />
                                <Bar dataKey="count" name="Problems">
                                  {tagDistribution.slice(0, 10).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={TAG_COLORS[index % TAG_COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-muted-foreground">No tag data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="progress" className="space-y-6">
                    {/* Weekly Progress */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp size={18} className="text-primary" />
                          Weekly Progress
                        </CardTitle>
                        <CardDescription>Problems completed over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          {weeklyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                  type="monotone"
                                  dataKey="completed"
                                  name="Completed"
                                  stackId="1"
                                  stroke="#6366F1"
                                  fill="#6366F1"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="total"
                                  name="Total"
                                  stackId="2"
                                  stroke="#94A3B8"
                                  fill="#94A3B8"
                                  fillOpacity={0.3}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-muted-foreground">No weekly progress data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Completion Rate Trend */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-primary" />
                          Completion Rate Trend
                        </CardTitle>
                        <CardDescription>Weekly completion percentage</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          {weeklyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip formatter={(value) => [`${value}%`, "Completion Rate"]} />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="rate"
                                  name="Completion Rate"
                                  stroke="#22C55E"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-muted-foreground">No completion rate data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="incomplete" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <ListChecks size={18} className="text-primary" />
                            Incomplete Problems
                          </CardTitle>
                          <Button variant="outline" size="sm" className="h-8">
                            <Filter size={14} className="mr-1" />
                            Filter
                          </Button>
                        </div>
                        <CardDescription>Problems you still need to complete</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2">
                          {incompleteProblems.length > 0 ? (
                            incompleteProblems.map((problem) => (
                              <ProblemItem key={problem.id} problem={problem} tags={tags} />
                            ))
                          ) : (
                            <div className="text-center py-12">
                              <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                              <h3 className="text-lg font-medium">All caught up!</h3>
                              <p className="text-muted-foreground mt-1">You've completed all your problems.</p>
                              <Button className="mt-4" onClick={() => (window.location.href = "/tracker")}>
                                <Plus size={16} className="mr-1" />
                                Add New Problem
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Difficulty Breakdown of Incomplete Problems */}
                    {incompleteProblems.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            Incomplete by Difficulty
                          </CardTitle>
                          <CardDescription>Breakdown of remaining problems</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-green-500" />
                                  <span className="text-sm font-medium">Easy</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {incompleteProblems.filter((p) => p.difficulty === "Easy").length} problems
                                </span>
                              </div>
                              <Progress
                                value={
                                  incompleteProblems.length > 0
                                    ? (incompleteProblems.filter((p) => p.difficulty === "Easy").length /
                                        incompleteProblems.length) *
                                      100
                                    : 0
                                }
                                className="h-2 bg-muted"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                  <span className="text-sm font-medium">Medium</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {incompleteProblems.filter((p) => p.difficulty === "Medium").length} problems
                                </span>
                              </div>
                              <Progress
                                value={
                                  incompleteProblems.length > 0
                                    ? (incompleteProblems.filter((p) => p.difficulty === "Medium").length /
                                        incompleteProblems.length) *
                                      100
                                    : 0
                                }
                                className="h-2 bg-muted"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-red-500" />
                                  <span className="text-sm font-medium">Hard</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {incompleteProblems.filter((p) => p.difficulty === "Hard").length} problems
                                </span>
                              </div>
                              <Progress
                                value={
                                  incompleteProblems.length > 0
                                    ? (incompleteProblems.filter((p) => p.difficulty === "Hard").length /
                                        incompleteProblems.length) *
                                      100
                                    : 0
                                }
                                className="h-2 bg-muted"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Recent Activity and Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar size={18} className="text-primary" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Your latest problem-solving activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {problems.length > 0 ? (
                          problems
                            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                            .slice(0, 5)
                            .map((problem) => (
                              <div key={problem.id} className="flex items-start gap-4">
                                <div
                                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                    problem.completed ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                  }`}
                                >
                                  {problem.completed ? <CheckCircle2 size={20} /> : <Code size={20} />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{problem.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {problem.platform}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {problem.completed ? "Completed" : "Added"}{" "}
                                    {format(problem.createdAt, "MMM d, yyyy 'at' h:mm a")}
                                  </p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal size={16} />
                                </Button>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy size={18} className="text-primary" />
                        Recommendations
                      </CardTitle>
                      <CardDescription>Suggested next steps</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {difficultyData[2].value === 0 && (
                          <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                            <h4 className="font-medium text-primary mb-1">Try Hard Problems</h4>
                            <p className="text-sm text-muted-foreground">
                              You haven't solved any Hard difficulty problems yet. Challenge yourself with harder
                              problems.
                            </p>
                          </div>
                        )}

                        {difficultyData[2].value > 0 && difficultyData[2].value < difficultyData[0].value * 0.2 && (
                          <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                            <h4 className="font-medium text-primary mb-1">Focus on Hard Problems</h4>
                            <p className="text-sm text-muted-foreground">
                              Only {Math.round((difficultyData[2].value / problems.length) * 100)}% of your problems are
                              Hard difficulty. Try tackling more challenging problems.
                            </p>
                          </div>
                        )}

                        {tagDistribution.length > 0 &&
                          tagDistribution[0].count > tagDistribution[tagDistribution.length - 1].count * 3 && (
                            <div className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                              <h4 className="font-medium text-yellow-500 mb-1">Explore More Tags</h4>
                              <p className="text-sm text-muted-foreground">
                                You haven't solved many problems with the "
                                {tagDistribution[tagDistribution.length - 1].name}" tag. This is an important topic for
                                interviews.
                              </p>
                            </div>
                          )}

                        {streak > 0 ? (
                          <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                            <h4 className="font-medium text-green-500 mb-1">Keep Your Streak Going</h4>
                            <p className="text-sm text-muted-foreground">
                              You're on a {streak}-day streak! Solve at least one problem today to maintain it.
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                            <h4 className="font-medium text-red-500 mb-1">Start a Streak</h4>
                            <p className="text-sm text-muted-foreground">
                              You don't have an active streak. Solve a problem today to start one!
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

