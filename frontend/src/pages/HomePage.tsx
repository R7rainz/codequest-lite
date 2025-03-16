"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Code, CheckCircle, BarChart2, Trophy, ArrowRight } from "lucide-react"
import { NavLink } from "react-router-dom"

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

// Sample data for the chart
const chartData = [
  { name: "Solved", value: 65, color: "#22c55e" },
  { name: "In Progress", value: 25, color: "#3b82f6" },
  { name: "Not Started", value: 10, color: "#6366f1" },
]

const HomePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="w-full flex-1 bg-background text-foreground overflow-hidden relative">
      <ParticleBackground />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section
          className={`flex flex-col items-center text-center transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="mb-6 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-75"></div>
            <div className="relative bg-background p-4 rounded-full">
              <Code size={48} className="text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            CodeQuest Lite
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-muted-foreground">
            Track your coding challenges, visualize your progress, and level up your skills
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <NavLink to="/signup" className="text-white">
            <Button size="lg" className="group">
              Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            </NavLink>
            <NavLink to="/about" className="text-white">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
            </NavLink>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card
            className={`transition-all duration-1000 delay-100 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <CardHeader>
              <div className="mb-2">
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                  Track
                </Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Code size={20} /> Add Challenges
              </CardTitle>
              <CardDescription>Log your coding problems from any platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
                <div className="p-4 border border-border rounded-md bg-card shadow-sm">
                  <div className="h-4 w-32 bg-muted-foreground/20 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-muted-foreground/10 rounded"></div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">
                Learn More
              </Button>
            </CardFooter>
          </Card>

          <Card
            className={`transition-all duration-1000 delay-200 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <CardHeader>
              <div className="mb-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Progress
                </Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle size={20} /> Mark as Solved
              </CardTitle>
              <CardDescription>Track your completion and success rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-md flex items-center justify-center bg-card border border-border"
                    >
                      <CheckCircle size={20} className="text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">
                Learn More
              </Button>
            </CardFooter>
          </Card>

          <Card
            className={`transition-all duration-1000 delay-300 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <CardHeader>
              <div className="mb-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Insights
                </Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 size={20} /> Visualize Progress
              </CardTitle>
              <CardDescription>See your improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* Stats Section */}
        <section
          className={`mt-24 transition-all duration-1000 delay-400 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Level Up Your Coding Skills</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers who are tracking their progress and improving their skills with CodeQuest
              Lite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Coding Challenges</div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">10k+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className={`mt-24 mb-12 transition-all duration-1000 delay-500 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <Card className="border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="text-yellow-500" /> Start Your Coding Journey
                </h3>
                <p className="text-muted-foreground mb-0 md:mb-4 max-w-md">
                  Begin tracking your progress today and see how far you can go. Join our community of developers
                  committed to continuous improvement.
                </p>
              </div>
              <NavLink to="/signup" className="text-white">
              <Button size="lg" className="whitespace-nowrap">
                Get Started Now
              </Button>
              </NavLink>    
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default HomePage

