import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, TagIcon, X, Edit, Trash2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SideNavBar from "@/components/SideNavBar"
import { db } from "@/config/config"
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, setDoc } from "firebase/firestore"
import { useAuth } from "@/hooks/useAuth"

// Types
interface Tag {
  id: string
  name: string
  color: string
}

// Sample data
const sampleTags: Tag[] = [
  { id: "1", name: "Arrays", color: "bg-blue-500" },
  { id: "2", name: "Strings", color: "bg-green-500" },
  { id: "3", name: "Dynamic Programming", color: "bg-purple-500" },
  { id: "4", name: "Trees", color: "bg-yellow-500" },
  { id: "5", name: "Graphs", color: "bg-red-500" },
  { id: "6", name: "Sorting", color: "bg-indigo-500" },
  { id: "7", name: "Binary Search", color: "bg-pink-500" },
  { id: "8", name: "Greedy", color: "bg-orange-500" },
]

// Available colors for tags
const colorOptions = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-teal-500", label: "Teal" },
  { value: "bg-cyan-500", label: "Cyan" },
]

const initializeUserTags = async (userId: string) => {
  try {
    const tagRef = collection(db, "users", userId, "tags")
    const snapshot = await getDocs(tagRef)

    if (snapshot.empty) {
      for (const tag of sampleTags) {
        const tagDocRef = doc(tagRef)
        await setDoc(tagDocRef, { name: tag.name, color: tag.color })
      }
      console.log("Default tags added for new user")
    }
  } catch (error) {
    console.error("Error initializing user tags", error)
  }
}

// Tag Card Component
const TagCard = ({
  tag,
  onEdit,
  onDelete,
}: {
  tag: Tag
  onEdit: (tag: Tag) => void
  onDelete: (id: string) => void
}) => {
  return (
    <Card className="bg-card/60 backdrop-blur-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={`${tag.color} text-white`}>
            <TagIcon size={12} className="mr-1" />
            {tag.name}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(tag)}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-500"
            onClick={() => onDelete(tag.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Tags Page Component
const TagsPage = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<string | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("bg-blue-500")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user: currentUser } = useAuth()

  // Providing the default tags to the new user
  useEffect(() => {
    if (currentUser) {
      initializeUserTags(currentUser.uid).then(() => {
        fetchTags()
      })
    }
  }, [currentUser])

  // Fetch tags from firestore
  const fetchTags = useCallback(async () => {
    if (!currentUser) return
    setIsLoading(true)

    try {
      const tagsRef = collection(db, "users", currentUser.uid, "tags")
      const snapshot = await getDocs(tagsRef)
      const fetchedTags = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        color: doc.data().color,
      })) as Tag[]

      setTags(fetchedTags)
    } catch (error) {
      console.error("Error fetching tags:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      fetchTags()
    }
  }, [currentUser, fetchTags])

  // Filter tags based on search query
  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      setError("Tag name cannot be empty")
      return
    }

    if (!currentUser) {
      setError("You must be logged in to add tags")
      return
    }

    // Check if tag name already exists
    if (tags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      setError("A tag with this name already exists")
      return
    }

    try {
      const tagsRef = collection(db, "users", currentUser.uid, "tags")
      const docRef = await addDoc(tagsRef, { name: newTagName, color: newTagColor })

      // Add the new tag to the state with the Firestore document ID
      setTags([...tags, { id: docRef.id, name: newTagName, color: newTagColor }])
      resetAndCloseDialog()
    } catch (error) {
      console.error("Error adding tag:", error)
      setError("Failed to add tag")
    }
  }

  const handleEditTag = async () => {
    if (!editingTag) return

    if (!newTagName.trim()) {
      setError("Tag name cannot be empty")
      return
    }

    if (!currentUser) {
      setError("You must be logged in to edit tags")
      return
    }

    // Check if tag name already exists (excluding the current tag)
    if (tags.some((tag) => tag.id !== editingTag.id && tag.name.toLowerCase() === newTagName.toLowerCase())) {
      setError("A tag with this name already exists")
      return
    }

    try {
      const tagRef = doc(db, "users", currentUser.uid, "tags", editingTag.id)
      await updateDoc(tagRef, { name: newTagName, color: newTagColor })

      setTags(tags.map((tag) => (tag.id === editingTag.id ? { ...tag, name: newTagName, color: newTagColor } : tag)))
      resetAndCloseDialog()
    } catch (error) {
      console.error("Error updating tag:", error)
      setError("Failed to update tag")
    }
  }

  const handleDeleteTag = async () => {
    if (!tagToDelete || !currentUser) return

    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "tags", tagToDelete))
      setTags(tags.filter((tag) => tag.id !== tagToDelete))
      setTagToDelete(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting tag:", error)
      setError("Failed to delete tag")
    }
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
    setError("")
    setIsAddDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    setTagToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const resetAndCloseDialog = () => {
    setNewTagName("")
    setNewTagColor("bg-blue-500")
    setEditingTag(null)
    setError("")
    setIsAddDialogOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SideNavBar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Tags Manager</h1>
              <p className="text-muted-foreground mt-1">Create and manage tags for your coding problems</p>
            </div>

            <Button
              onClick={() => {
                setEditingTag(null)
                setNewTagName("")
                setNewTagColor("bg-blue-500")
                setError("")
                setIsAddDialogOpen(true)
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <Plus size={18} className="mr-1" />
              Create Tag
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="pl-10"
            />
            <TagIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {/* Tags Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <TagCard key={tag.id} tag={tag} onEdit={openEditDialog} onDelete={openDeleteDialog} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <TagIcon size={24} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No tags found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery ? "Try adjusting your search query" : "Create your first tag to get started"}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Tag Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
            <DialogDescription>
              {editingTag
                ? "Update the name and color of your tag"
                : "Add a new tag to categorize your coding problems"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., Arrays, Dynamic Programming"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagColor">Tag Color</Label>
              <Select value={newTagColor} onValueChange={setNewTagColor}>
                <SelectTrigger id="tagColor">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Label>Preview</Label>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={`${newTagColor} text-white`}>
                  <TagIcon size={12} className="mr-1" />
                  {newTagName || "Tag Preview"}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetAndCloseDialog}>
              Cancel
            </Button>
            <Button onClick={editingTag ? handleEditTag : handleAddTag}>
              {editingTag ? "Save Changes" : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this tag. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TagsPage

