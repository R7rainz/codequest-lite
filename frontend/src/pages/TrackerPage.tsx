import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, LinkIcon, X, Tag, Check, ExternalLink, Calendar, Filter, SortAsc, SortDesc } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import SideNavBar from "@/components/SideNavBar"
import { auth } from "@/config/auth"
import { collection, addDoc, Timestamp, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/config/config"

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

// Custom hook for click away detection
const useClickAway = (callback: () => void) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [callback])

  return ref
}

// Floating Form Component
const AddProblemForm = ({
  isOpen,
  onClose,
  onAdd,
  availableTags,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (problem: Omit<Problem, "id" | "createdAt">) => void
  availableTags: {
    id: string
    name: string
    color: string
  }[]
}) => {
  const [name, setName] = useState("")
  const [link, setLink] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy")
  const [platform, setPlatform] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)

  const formRef = useClickAway(() => {
    if (isOpen) onClose()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const user = auth.currentUser

    if (!user) {
      console.log("No authentication found")
      return
    }

    //problem object
    const newProblem = {
      name,
      link,
      tags: selectedTags,
      completed: false,
      difficulty,
      platform,
      createdAt: Timestamp.now(),
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/problems`), newProblem)
      console.log("Problem added successfully")

      onAdd(newProblem)
    } catch (error) {
      console.error("Error adding problems", error)
    }

    // Reset form
    setName("")
    setLink("")
    setSelectedTags([])
    setDifficulty("Easy")
    setPlatform("")
    onClose()
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="w-full max-w-md"
            ref={formRef}
          >
            <Card className="border-0 shadow-lg bg-card/90 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Add New Problem</h2>
                  <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X size={18} />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Problem Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Two Sum"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="link" className="text-sm font-medium">
                        Problem Link
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setShowLinkInput(!showLinkInput)}
                      >
                        {showLinkInput ? <X size={14} className="mr-1" /> : <LinkIcon size={14} className="mr-1" />}
                        {showLinkInput ? "Hide" : "Add Link"}
                      </Button>
                    </div>

                    {showLinkInput && (
                      <div className="relative">
                        <LinkIcon
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          id="link"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder="https://leetcode.com/problems/..."
                          className="pl-9"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <div className="flex gap-2">
                      {["Easy", "Medium", "Hard"].map((level) => (
                        <Button
                          key={level}
                          type="button"
                          variant={difficulty === level ? "default" : "outline"}
                          size="sm"
                          className={`flex-1 ${
                            difficulty === level
                              ? level === "Easy"
                                ? "bg-green-500 hover:bg-green-600"
                                : level === "Medium"
                                  ? "bg-yellow-500 hover:bg-yellow-600"
                                  : "bg-red-500 hover:bg-red-600"
                              : ""
                          }`}
                          onClick={() => setDifficulty(level as "Easy" | "Medium" | "Hard")}
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="platform" className="text-sm font-medium">
                      Platform
                    </label>
                    <Input
                      id="platform"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      placeholder="e.g., LeetCode, Codeforce"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-background/50">
                      {availableTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                          className={`cursor-pointer ${selectedTags.includes(tag.id) ? tag.color : ""}`}
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                          {selectedTags.includes(tag.id) && <Check size={12} className="ml-1" />}
                        </Badge>
                      ))}
                      {availableTags.length === 0 && (
                        <p className="text-sm text-muted-foreground p-2">
                          No tags available. Create tags in the Tags page.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Problem</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Problem Card Component
const ProblemCard = ({
  problem,
  tags,
  onToggleComplete,
  onDelete,
}: {
  problem: Problem
  tags: {
    id: string
    name: string
    color: string
  }[]
  onToggleComplete: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}) => {
  const problemTags = tags.filter((tag) => problem.tags.includes(tag.id))
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${problem.completed ? "bg-muted/30" : "bg-card"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id={`problem-${problem.id}`}
            checked={problem.completed}
            onCheckedChange={(checked) => onToggleComplete(problem.id, checked as boolean)}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium truncate ${problem.completed ? "line-through text-muted-foreground" : ""}`}>
                {problem.name}
              </h3>
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
              <span className="flex items-center">
                <Calendar size={12} className="mr-1" />
                {format(problem.createdAt, "MMM d, yyyy")}
              </span>
              <span>•</span>
              <span>{problem.platform}</span>
              <span>•</span>
              <span
                className={`
                px-1.5 py-0.5 rounded-full text-xs font-medium
                ${
                  problem.difficulty === "Easy"
                    ? "bg-green-500/10 text-green-500"
                    : problem.difficulty === "Medium"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-red-500/10 text-red-500"
                }
              `}
              >
                {problem.difficulty}
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

          <div className="relative">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <Button variant="destructive" size="sm" className="h-7 px-2" onClick={() => onDelete(problem.id)}>
                  Delete
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-100/50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Tracker Page Component
const TrackerPage = () => {
  const [problems, setProblems] = useState<Problem[]>([])
  const [tags, setTags] = useState<
    {
      id: string
      name: string
      color: string
    }[]
  >([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showCompleted, setShowCompleted] = useState(true)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch tags from Firestore
  const fetchTags = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    try {
      setIsLoading(true)
      const tagsRef = collection(db, "users", user.uid, "tags")
      const querySnapshot = await getDocs(tagsRef)
      const tagsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        color: doc.data().color,
      })) as {
        id: string
        name: string
        color: string
      }[]

      setTags(tagsArray)
    } catch (error) {
      console.error("Error fetching tags", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch problems from Firestore
  const fetchProblems = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    try {
      setIsLoading(true)
      const problemsRef = collection(db, "users", user.uid, "problems")
      const querySnapshot = await getDocs(problemsRef)
      const problemsArray = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          link: data.link || "",
          tags: data.tags || [],
          completed: data.completed || false,
          difficulty: data.difficulty || "Easy",
          platform: data.platform || "",
          createdAt: data.createdAt?.toDate() || new Date(),
        }
      }) as Problem[]

      setProblems(problemsArray)
    } catch (error) {
      console.error("Error fetching problems", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load data on component mount
  useEffect(() => {
    fetchTags()
    fetchProblems()
  }, [fetchTags, fetchProblems])

  // Filter problems based on search query, selected tags, and completion status
  const filteredProblems = problems
    .filter((problem) => {
      const matchesSearch =
        problem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.platform.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTags = selectedTags.length === 0 || selectedTags.some((tagId) => problem.tags.includes(tagId))

      const matchesCompletion = showCompleted || !problem.completed

      return matchesSearch && matchesTags && matchesCompletion
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.createdAt.getTime() - b.createdAt.getTime()
      } else {
        return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

  const handleAddProblem = (newProblem: Omit<Problem, "id" | "createdAt">) => {
    // The actual adding to Firestore is handled in the form component
    // Here we just refresh the problems list
    fetchProblems()
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    const user = auth.currentUser
    if (!user) return

    try {
      const problemRef = doc(db, "users", user.uid, "problems", id)
      await updateDoc(problemRef, { completed })

      // Update local state
      setProblems((prev) => prev.map((problem) => (problem.id === id ? { ...problem, completed } : problem)))
    } catch (error) {
      console.error("Error updating problem completion status", error)
    }
  }

  // Add delete problem function
  const handleDeleteProblem = async (id: string) => {
    const user = auth.currentUser
    if (!user) return

    try {
      // Delete from Firestore
      const problemRef = doc(db, "users", user.uid, "problems", id)
      await deleteDoc(problemRef)

      // Update local state
      setProblems((prev) => prev.filter((problem) => problem.id !== id))
    } catch (error) {
      console.error("Error deleting problem", error)
    }
  }

  const toggleTagFilter = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setShowCompleted(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SideNavBar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Problem Tracker</h1>
              <p className="text-muted-foreground mt-1">Track and organize your coding challenges</p>
            </div>

            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <Plus size={18} className="mr-1" />
              Add Problem
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-card/60 backdrop-blur-sm border rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search problems by name or platform..."
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                  className="h-10 w-10"
                  title={sortOrder === "asc" ? "Oldest first" : "Newest first"}
                >
                  {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`h-10 ${!showCompleted ? "bg-primary/10 text-primary" : ""}`}
                >
                  <Filter size={16} className="mr-1" />
                  {showCompleted ? "Show All" : "Hide Completed"}
                </Button>

                {(searchQuery || selectedTags.length > 0 || !showCompleted) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Tags filter */}
            {tags.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium flex items-center">
                    <Tag size={14} className="mr-1" />
                    Filter by tags:
                  </span>

                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className={`cursor-pointer ${selectedTags.includes(tag.id) ? tag.color : ""}`}
                      onClick={() => toggleTagFilter(tag.id)}
                    >
                      {tag.name}
                      {selectedTags.includes(tag.id) && <X size={12} className="ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Problems List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    tags={tags}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteProblem}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <Search size={24} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No problems found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery || selectedTags.length > 0 || !showCompleted
                      ? "Try adjusting your filters or search query"
                      : "Add your first problem to get started"}
                  </p>
                  {(searchQuery || selectedTags.length > 0 || !showCompleted) && (
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add Problem Form */}
          <AddProblemForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onAdd={handleAddProblem}
            availableTags={tags}
          />
        </div>
      </div>
    </div>
  )
}

export default TrackerPage

