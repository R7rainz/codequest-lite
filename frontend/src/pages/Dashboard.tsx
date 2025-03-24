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
import { format, subDays } from "date-fns"
import { motion } from "framer-motion"
import SideNavBar from "@/components/SideNavBar"

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

// Sample data
const sampleTags: TagType[] = [
  { id: "1", name: "Arrays", color: "bg-blue-500" },
  { id: "2", name: "Strings", color: "bg-green-500" },
  { id: "3", name: "Dynamic Programming", color: "bg-purple-500" },
  { id: "4", name: "Trees", color: "bg-yellow-500" },
  { id: "5", name: "Graphs", color: "bg-red-500" },
  { id: "6", name: "Sorting", color: "bg-indigo-500" },
  { id: "7", name: "Binary Search", color: "bg-pink-500" },
  { id: "8", name: "Greedy", color: "bg-orange-500" },
  { id: "9", name: "Backtracking", color: "bg-teal-500" },
  { id: "10", name: "Linked Lists", color: "bg-cyan-500" },
]

// Generate more sample problems for a better dashboard
const generateSampleProblems = () => {
  const platforms = ["LeetCode", "HackerRank", "CodeSignal", "CodeForces", "AlgoExpert"]
  const problems: Problem[] = []

  // Generate 50 sample problems
  for (let i = 1; i <= 50; i++) {
    const randomTags = []
    const tagCount = Math.floor(Math.random() * 3) + 1 // 1-3 tags per problem

    for (let j = 0; j < tagCount; j++) {
      const randomTagId = Math.floor(Math.random() * sampleTags.length) + 1
      if (!randomTags.includes(randomTagId.toString())) {
        randomTags.push(randomTagId.toString())
      }
    }

    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)]
    const randomDifficulty = ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as "Easy" | "Medium" | "Hard"
    const randomCompleted = Math.random() > 0.4 // 60% chance of being completed

    // Create random date within the last 90 days
    const randomDaysAgo = Math.floor(Math.random() * 90)
    const randomDate = subDays(new Date(), randomDaysAgo)

    problems.push({
      id: i.toString(),
      name: `Problem ${i}`,
      link: `https://example.com/problem-${i}`,
      tags: randomTags,
      completed: randomCompleted,
      difficulty: randomDifficulty,
      platform: randomPlatform,
      createdAt: randomDate,
    })
  }

  return problems
}

const sampleProblems = generateSampleProblems()

// Interactive background component (same as other pages)
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

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Calculate statistics
  const totalProblems = sampleProblems.length
  const completedProblems = sampleProblems.filter((p) => p.completed).length
  const completionRate = Math.round((completedProblems / totalProblems) * 100)
  const incompleteProblems = sampleProblems.filter((p) => !p.completed)

  // Calculate difficulty distribution
  const easyProblems = sampleProblems.filter((p) => p.difficulty === "Easy").length
  const mediumProblems = sampleProblems.filter((p) => p.difficulty === "Medium").length
  const hardProblems = sampleProblems.filter((p) => p.difficulty === "Hard").length

  // Calculate platform distribution
  const platformData = sampleProblems.reduce((acc: { name: string; value: number }[], problem) => {
    const existingPlatform = acc.find((p) => p.name === problem.platform)
    if (existingPlatform) {
      existingPlatform.value++
    } else {
      acc.push({ name: problem.platform, value: 1 })
    }
    return acc
  }, [])

  // Calculate tag distribution
  const tagDistribution = sampleTags
    .map((tag) => {
      const count = sampleProblems.filter((p) => p.tags.includes(tag.id)).length
      return {
        name: tag.name,
        count,
        color: tag.color.replace("bg-", ""),
      }
    })
    .sort((a, b) => b.count - a.count)

  // Generate weekly progress data
  const generateWeeklyData = () => {
    const weeks: { [key: string]: { completed: number; total: number } } = {}

    // Group by week
    sampleProblems.forEach((problem) => {
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
          rate: Math.round((data.completed / data.total) * 100),
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-8) // Last 8 weeks
  }

  const weeklyData = generateWeeklyData()

  // Colors for charts
  const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#8B5CF6", "#EC4899", "#F97316"]
  const DIFFICULTY_COLORS = {
    Easy: "#22C55E",
    Medium: "#F59E0B",
    Hard: "#EF4444",
  }

  return (
    <div> <SideNavBar />
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
              <Button variant="outline" size="sm" onClick={() => setTimeRange("week")}>
                This Week
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTimeRange("month")}>
                This Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTimeRange("all")}>
                All Time
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <StatCard
                title="Total Problems"
                value={totalProblems}
                icon={<Code size={18} />}
                trend={{ value: 12, label: "from last month" }}
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
                trend={{ value: 5, label: "from last month" }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <StatCard
                title="Streak"
                value="7 days"
                icon={<TrendingUp size={18} />}
                description="Keep it up! You're on a roll."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <StatCard
                title="Avg. Difficulty"
                value="Medium"
                icon={<Trophy size={18} />}
                description="Most of your problems are Medium difficulty."
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
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} problems`, "Count"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
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
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: "Easy", value: easyProblems, color: DIFFICULTY_COLORS.Easy },
                            { name: "Medium", value: mediumProblems, color: DIFFICULTY_COLORS.Medium },
                            { name: "Hard", value: hardProblems, color: DIFFICULTY_COLORS.Hard },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} problems`, "Count"]} />
                          <Bar dataKey="value" name="Problems">
                            {[
                              { name: "Easy", value: easyProblems, color: DIFFICULTY_COLORS.Easy },
                              { name: "Medium", value: mediumProblems, color: DIFFICULTY_COLORS.Medium },
                              { name: "Hard", value: hardProblems, color: DIFFICULTY_COLORS.Hard },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
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
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
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
                        <ProblemItem key={problem.id} problem={problem} tags={sampleTags} />
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
                            (incompleteProblems.filter((p) => p.difficulty === "Easy").length /
                              incompleteProblems.length) *
                            100
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
                            (incompleteProblems.filter((p) => p.difficulty === "Medium").length /
                              incompleteProblems.length) *
                            100
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
                            (incompleteProblems.filter((p) => p.difficulty === "Hard").length /
                              incompleteProblems.length) *
                            100
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
                  {sampleProblems
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .slice(0, 5)
                    .map((problem, index) => (
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
                    ))}
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
                  <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                    <h4 className="font-medium text-primary mb-1">Focus on Hard Problems</h4>
                    <p className="text-sm text-muted-foreground">
                      Only {Math.round((hardProblems / totalProblems) * 100)}% of your problems are Hard difficulty. Try
                      tackling more challenging problems.
                    </p>
                  </div>

                  <div className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                    <h4 className="font-medium text-yellow-500 mb-1">Explore More Tags</h4>
                    <p className="text-sm text-muted-foreground">
                      You haven't solved many problems with the "Backtracking" tag. This is an important topic for
                      interviews.
                    </p>
                  </div>

                  <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                    <h4 className="font-medium text-green-500 mb-1">Keep Your Streak Going</h4>
                    <p className="text-sm text-muted-foreground">
                      You're on a 7-day streak! Solve at least one problem today to maintain it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Dashboard

