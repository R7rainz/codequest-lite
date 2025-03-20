import { useState } from "react"
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
          <Badge className={`${tag.color}`}>
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
  const [tags, setTags] = useState<Tag[]>(sampleTags)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<string | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("bg-blue-500")
  const [error, setError] = useState("")

  // Filter tags based on search query
  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      setError("Tag name cannot be empty")
      return
    }

    // Check if tag name already exists
    if (tags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      setError("A tag with this name already exists")
      return
    }

    const newTag: Tag = {
      id: (tags.length + 1).toString(),
      name: newTagName.trim(),
      color: newTagColor,
    }

    setTags([...tags, newTag])
    resetAndCloseDialog()
  }

  const handleEditTag = () => {
    if (!editingTag) return

    if (!newTagName.trim()) {
      setError("Tag name cannot be empty")
      return
    }

    // Check if tag name already exists (excluding the current tag)
    if (tags.some((tag) => tag.id !== editingTag.id && tag.name.toLowerCase() === newTagName.toLowerCase())) {
      setError("A tag with this name already exists")
      return
    }

    setTags((prev) =>
      prev.map((tag) => (tag.id === editingTag.id ? { ...tag, name: newTagName.trim(), color: newTagColor } : tag)),
    )

    resetAndCloseDialog()
  }

  const handleDeleteTag = () => {
    if (!tagToDelete) return

    setTags((prev) => prev.filter((tag) => tag.id !== tagToDelete))
    setTagToDelete(null)
    setIsDeleteDialogOpen(false)
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
    <div className="container mx-auto px-4 py-8">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Badge className={`${newTagColor}`}>
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

