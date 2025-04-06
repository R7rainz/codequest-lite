import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  updateProfile,
  updateEmail,
  updatePassword,
  type User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  //multiFactor,
  type RecaptchaVerifier,
  getAuth,
  deleteUser,
} from "firebase/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
// Add the missing Mail icon import
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Github,
  Globe,
  Key,
  Linkedin,
  Lock,
  LogOut,
  Mail,
  Save,
  Settings,
  Shield,
  Trophy,
  Twitter,
  UserIcon,
  X,
  Download,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
// Import the necessary Firestore functions
import { db, auth } from "@/config/config"
import { logout } from "@/config/auth"
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  addDoc,
  getFirestore,
  deleteDoc,
} from "firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDeleteAccount } from "@/hooks/useDeleteAccount"

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

// User preferences interface
interface UserPreferences {
  emailNotifications: boolean
  weeklyDigest: boolean
  publicProfile: boolean
  theme: string
  bio: string
  location: string
  githubUrl: string
  twitterUrl: string
  linkedinUrl: string
  websiteUrl: string
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Profile form state
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationId, setVerificationId] = useState("")
  const [step2FA, setStep2FA] = useState<"phone" | "code">("phone")
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)

  // Add state for email 2FA
  const [emailFor2FA, setEmailFor2FA] = useState("")
  const [is2FAEmailSent, setIs2FAEmailSent] = useState(false)

  const signupDate = user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : null

  // Avoid calling .toLocaleDateString() on null
  const formattedDate = signupDate ? signupDate.toLocaleDateString() : "N/A"

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)
  const [theme, setTheme] = useState("dark")

  // Social links
  const [githubUrl, setGithubUrl] = useState("")
  const [twitterUrl, setTwitterUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")

  // Stats state
  const [difficultyData, setDifficultyData] = useState([
    { name: "Easy", value: 0, color: "#22C55E" },
    { name: "Medium", value: 0, color: "#F59E0B" },
    { name: "Hard", value: 0, color: "#EF4444" },
  ])
  const [problemsSolved, setProblemsSolved] = useState(0)
  const [streak, setStreak] = useState(0)

  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  // const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  // Check if 2FA is enabled
  // const check2FAStatus = (user: User) => {
  //   try {
  //     const multiFactorUser = multiFactor(user)
  //     const enrolledFactors = multiFactorUser.enrolledFactors
  //     setIs2FAEnabled(enrolledFactors.length > 0)
  //   } catch (error) {
  //     console.error("Error checking 2FA status:", error)
  //     setIs2FAEnabled(false)
  //   }
  // }

  //delete account hook
  const deleteAccount = useDeleteAccount();

  const [isEmailPasswordUser, setIsEmailPasswordUser] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if any provider is "password"
        const hasPasswordProvider = currentUser.providerData.some(
          (provider) => provider.providerId === "password"
        );
        setIsEmailPasswordUser(hasPasswordProvider);
      } else {
        setUser(null);
        setIsEmailPasswordUser(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);


  // Calculate streak
  const calculateStreak = async (userId: string): Promise<number> => {
    try {
      // Get completed problems sorted by date (newest first)
      const problemsRef = collection(db, `users/${userId}/problems`)
      const q = query(problemsRef, where("completed", "==", true))
      const querySnapshot = await getDocs(q)

      const completedProblems: { createdAt: Date }[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        completedProblems.push({
          createdAt: data.createdAt?.toDate() || new Date(),
        })
      })

      // Sort by date (newest first)
      completedProblems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      if (completedProblems.length === 0) return 0

      // Check if there's a problem completed today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const latestDate = new Date(completedProblems[0].createdAt)
      latestDate.setHours(0, 0, 0, 0)

      // If the latest problem is not from today, streak is 0
      if (latestDate.getTime() !== today.getTime()) return 0

      // Count consecutive days
      let streak = 1
      let currentDate = today

      for (let i = 1; i < completedProblems.length; i++) {
        const prevDay = new Date(currentDate)
        prevDay.setDate(prevDay.getDate() - 1)

        const problemDate = new Date(completedProblems[i].createdAt)
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
    } catch (error) {
      console.error("Error calculating streak:", error)
      return 0
    }
  }

  // Save user preferences
  const saveUserPreferences = async () => {
    if (!user) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const userPrefsRef = doc(db, `users/${user.uid}/preferences/settings`)

      const prefsData: UserPreferences = {
        emailNotifications,
        weeklyDigest,
        publicProfile,
        theme,
        bio,
        location,
        githubUrl,
        twitterUrl,
        linkedinUrl,
        websiteUrl,
      }

      await setDoc(userPrefsRef, prefsData, { merge: true })

      // Apply theme change immediately
      document.documentElement.classList.remove("light", "dark")
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        document.documentElement.classList.add(systemTheme)
      } else {
        document.documentElement.classList.add(theme)
      }

      setSuccess("Preferences saved successfully!")
    } catch (error) {
      console.error("Error saving preferences:", error)
      setError(`Failed to save preferences: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user data and preferences
  const fetchUserData = async (user: User) => {
    try {
      // Fetch user preferences
      const userPrefsRef = doc(db, `users/${user.uid}/preferences/settings`)
      const userPrefsSnap = await getDoc(userPrefsRef)

      if (userPrefsSnap.exists()) {
        const prefsData = userPrefsSnap.data() as UserPreferences

        // Set preferences
        setEmailNotifications(prefsData.emailNotifications ?? true)
        setWeeklyDigest(prefsData.weeklyDigest ?? true)
        setPublicProfile(prefsData.publicProfile ?? false)
        setTheme(prefsData.theme ?? "system")

        // Apply theme immediately
        document.documentElement.classList.remove("light", "dark")
        if (prefsData.theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          document.documentElement.classList.add(systemTheme)
        } else {
          document.documentElement.classList.add(prefsData.theme || "light")
        }

        // Set profile info
        setBio(prefsData.bio || "Full-stack developer passionate about algorithms and data structures.")
        setLocation(prefsData.location || "San Francisco, CA")

        // Set social links
        setGithubUrl(prefsData.githubUrl || "")
        setTwitterUrl(prefsData.twitterUrl || "")
        setLinkedinUrl(prefsData.linkedinUrl || "")
        setWebsiteUrl(prefsData.websiteUrl || "")
      } else {
        // Set defaults if no preferences exist
        setBio("Full-stack developer passionate about algorithms and data structures.")
        setLocation("San Francisco, CA")

        // Apply default theme
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add("light")
      }

      // Fetch problem stats
      const querySnapshot = await getDocs(collection(db, `users/${user.uid}/problems`))
      const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 }

      querySnapshot.forEach((doc) => {
        const { difficulty } = doc.data()
        if (difficultyCount[difficulty] !== undefined) {
          difficultyCount[difficulty]++
        }
      })

      const total = difficultyCount.Easy + difficultyCount.Medium + difficultyCount.Hard
      setProblemsSolved(total)

      setDifficultyData([
        { name: "Easy", value: difficultyCount.Easy, color: "#22C55E" },
        { name: "Medium", value: difficultyCount.Medium, color: "#F59E0B" },
        { name: "Hard", value: difficultyCount.Hard, color: "#EF4444" },
      ])

      // Calculate streak
      const userStreak = await calculateStreak(user.uid)
      setStreak(userStreak)

      // Check 2FA status
      // check2FAStatus(user)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load user data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Save user preferences
  /*const saveUserPreferences = async () => {
    if (!user) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const userPrefsRef = doc(db, `users/${user.uid}/preferences/settings`)

      const prefsData: UserPreferences = {
        emailNotifications,
        weeklyDigest,
        publicProfile,
        theme,
        bio,
        location,
        githubUrl,
        twitterUrl,
        linkedinUrl,
        websiteUrl,
      }

      await setDoc(userPrefsRef, prefsData, { merge: true })

      setSuccess("Preferences saved successfully!")
    } catch (error) {
      console.error("Error saving preferences:", error)
      setError(`Failed to save preferences: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }*/

  useEffect(() => {
    setIsVisible(true)

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setDisplayName(currentUser.displayName || "")
        setEmail(currentUser.email || "")
        setAvatarUrl(currentUser.photoURL || "")

        // Check if 2FA is enabled in Firestore
        try {
          const userPrefsRef = doc(db, `users/${currentUser.uid}/preferences/settings`)
          const userPrefsSnap = await getDoc(userPrefsRef)

          if (userPrefsSnap.exists()) {
            const prefsData = userPrefsSnap.data()
            setIs2FAEnabled(prefsData.twoFactorEnabled || false)
          }
        } catch (error) {
          console.error("Error checking 2FA status:", error)
        }

        // Fetch user data
        fetchUserData(currentUser)
      } else {
        // Redirect to login if not authenticated
        navigate("/login")
      }
    })

    return () => unsubscribe()
  }, [auth, navigate])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Update display name and photo URL
      await updateProfile(user, {
        displayName,
        photoURL: avatarUrl,
      })

      // Update email if changed
      if (email !== user.email) {
        await updateEmail(user, email)
      }

      // Save other profile info to Firestore
      const userPrefsRef = doc(db, `users/${user.uid}/preferences/settings`)
      await updateDoc(userPrefsRef, {
        bio,
        location,
        githubUrl,
        twitterUrl,
        linkedinUrl,
        websiteUrl,
      })

      setSuccess("Profile updated successfully!")
    } catch (error) {
      setError(`Failed to update profile: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !user.email) return

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)

      setSuccess("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setError(`Failed to update password: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload this file to storage
      // For now, we'll just create a local URL
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
    }
  }

  const handleSignOut = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      setError(`Failed to sign out: ${(error as Error).message}`)
    }
  }

  // 2FA setup
  /*const setup2FA = async () => {
    if (!user) return

    setIs2FADialogOpen(true)
    setStep2FA("phone")
    setPhoneNumber("")
    setVerificationCode("")
    setError("")

    // Initialize RecaptchaVerifier
    if (recaptchaContainerRef.current) {
      try {
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: "normal",
          callback: () => {
            // reCAPTCHA solved, allow sending verification code
          },
        })
        setRecaptchaVerifier(verifier)
      } catch (error) {
        console.error("Error initializing RecaptchaVerifier:", error)
        setError(`Failed to initialize verification: ${(error as Error).message}`)
      }
    }
  }*/

  // // Update the setup2FA function to use email
  // const setup2FA = async () => {
  //   if (!user) return

  //   setIs2FADialogOpen(true)
  //   setStep2FA("email")
  //   setEmailFor2FA(user.email || "")
  //   setVerificationCode("")
  //   setError("")
  //   setIs2FAEmailSent(false)
  // }

  // Add a function to send verification email
  // const sendVerificationEmail = async () => {
  //   if (!user || !emailFor2FA) return

  //   setIsLoading(true)
  //   setError("")

  //   try {
  //     // In a real implementation, you would send a verification email here
  //     // For this example, we'll simulate it

  //     // Generate a random 6-digit code
  //     const code = Math.floor(100000 + Math.random() * 900000).toString()

  //     // Store the code in Firestore with an expiration time (10 minutes)
  //     const verificationRef = await addDoc(collection(db, `users/${user.uid}/verificationCodes`), {
  //       code,
  //       email: emailFor2FA,
  //       createdAt: Timestamp.now(),
  //       expiresAt: Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)), // 10 minutes
  //       type: "2FA_SETUP",
  //     })

  //     setVerificationId(verificationRef.id)
  //     setStep2FA("code")
  //     setIs2FAEmailSent(true)
  //     setSuccess("Verification code sent to your email!")

  //     // In a real app, you would send an actual email with the code
  //     console.log("Verification code (for demo purposes):", code)
  //   } catch (error) {
  //     console.error("Error sending verification email:", error)
  //     setError(`Failed to send verification email: ${(error as Error).message}`)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  /*const sendVerificationCode = async () => {
    if (!user || !recaptchaVerifier || !phoneNumber) return

    setIsLoading(true)
    setError("")

    try {
      const multiFactorSession = await multiFactor(user).getSession()

      // Send verification code to the user's phone
      const phoneInfoOptions = {
        phoneNumber,
        session: multiFactorSession,
      }

      const phoneAuthProvider = new PhoneAuthProvider(auth)
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)

      setVerificationId(verificationId)
      setStep2FA("code")
      setSuccess("Verification code sent to your phone!")
    } catch (error) {
      console.error("Error sending verification code:", error)
      setError(`Failed to send verification code: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }*/

  // Update the verifyAndEnroll function for email 2FA
  // const verifyAndEnroll = async () => {
  //   if (!user || !verificationId || !verificationCode) return

  //   setIsLoading(true)
  //   setError("")

  //   try {
  //     // In a real implementation, you would verify the code against what was sent
  //     // For this example, we'll simulate it by checking against what's in Firestore

  //     const verificationRef = doc(db, `users/${user.uid}/verificationCodes/${verificationId}`)
  //     const verificationSnap = await getDoc(verificationRef)

  //     if (!verificationSnap.exists()) {
  //       throw new Error("Verification code not found")
  //     }

  //     const verificationData = verificationSnap.data()
  //     const now = Timestamp.now()

  //     if (now.toMillis() > verificationData.expiresAt.toMillis()) {
  //       throw new Error("Verification code has expired")
  //     }

  //     if (verificationData.code !== verificationCode) {
  //       throw new Error("Invalid verification code")
  //     }

  //     // Enable 2FA in user preferences
  //     const userPrefsRef = doc(db, `users/${user.uid}/preferences/settings`)
  //     await updateDoc(userPrefsRef, {
  //       twoFactorEnabled: true,
  //       twoFactorMethod: "email",
  //       twoFactorEmail: emailFor2FA,
  //     })

  //     setIs2FAEnabled(true)
  //     setIs2FADialogOpen(false)
  //     setSuccess("Two-factor authentication enabled successfully!")
  //   } catch (error) {
  //     console.error("Error verifying code:", error)
  //     setError(`Failed to enable 2FA: ${(error as Error).message}`)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  /*const verifyAndEnroll = async () => {
    if (!user || !verificationId || !verificationCode) return

    setIsLoading(true)
    setError("")

    try {
      // Create credential
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode)
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential)

      // Enroll the second factor
      await multiFactor(user).enroll(multiFactorAssertion, "My Phone Number")

      setIs2FAEnabled(true)
      setIs2FADialogOpen(false)
      setSuccess("Two-factor authentication enabled successfully!")
    } catch (error) {
      console.error("Error enrolling second factor:", error)
      setError(`Failed to enable 2FA: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }*/

  // Update the disable2FA function
  // const disable2FA = async () => {
  //   if (!user) return

  //   setIsLoading(true)
  //   setError("")

  //   try {
  //     // Disable 2FA in user preferences
  //     const userPrefsRef = doc(db, `users/${user.uid}/preferences/settings`)
  //     await updateDoc(userPrefsRef, {
  //       twoFactorEnabled: false,
  //       twoFactorMethod: null,
  //       twoFactorEmail: null,
  //     })

  //     setIs2FAEnabled(false)
  //     setSuccess("Two-factor authentication disabled successfully!")
  //   } catch (error) {
  //     console.error("Error disabling 2FA:", error)
  //     setError(`Failed to disable 2FA: ${(error as Error).message}`)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  /*const disable2FA = async () => {
    if (!user) return

    setIsLoading(true)
    setError("")

    try {
      const multiFactorUser = multiFactor(user)
      const enrolledFactors = multiFactorUser.enrolledFactors

      if (enrolledFactors.length > 0) {
        // Unenroll the first enrolled factor (typically there's only one)
        await multiFactorUser.unenroll(enrolledFactors[0])
        setIs2FAEnabled(false)
        setSuccess("Two-factor authentication disabled successfully!")
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error)
      setError(`Failed to disable 2FA: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }*/

  return (
    <div className="w-full flex-1 bg-background text-foreground overflow-hidden relative">
      <ParticleBackground />

      <div className="container mx-auto px-4 py-8">
        <div
          className={`transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
            </div>

            <Button variant="destructive" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar with user info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-2 border-primary/20">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {displayName ? displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleAvatarClick}
                      >
                        <Camera size={14} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>

                    <h2 className="mt-4 text-xl font-bold">{displayName || "User"}</h2>
                    <p className="text-muted-foreground text-sm">{email}</p>

                    {/* Update the badge to show email 2FA
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Badge variant="secondary">Member since {formattedDate}</Badge>
                      {is2FAEnabled && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Email 2FA Enabled
                        </Badge>
                      )}
                    </div> */}
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
                      <p className="text-sm">{bio}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Location</h3>
                      <p className="text-sm flex items-center gap-1">
                        <Globe size={14} />
                        {location}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Social Links</h3>
                      <div className="flex gap-2">
                        {githubUrl && (
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" asChild>
                            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github size={14} />
                            </a>
                          </Button>
                        )}
                        {twitterUrl && (
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" asChild>
                            <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                              <Twitter size={14} />
                            </a>
                          </Button>
                        )}
                        {linkedinUrl && (
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" asChild>
                            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin size={14} />
                            </a>
                          </Button>
                        )}
                        {websiteUrl && (
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" asChild>
                            <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                              <Globe size={14} />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy size={18} className="text-primary" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Problems Solved</span>
                      <div>
                        <span className="font-medium">{problemsSolved}</span>
                      </div>
                    </div>
                    <Progress value={problemsSolved} max={100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Streak</span>
                      <span className="font-medium">
                        {streak} day{streak !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(7, streak) }).map((_, i) => (
                        <div
                          key={i}
                          className="h-2 flex-1 rounded-full bg-primary"
                          style={{ opacity: 0.5 + i * 0.07 }}
                        />
                      ))}
                      {streak === 0 && <div className="h-2 flex-1 rounded-full bg-gray-200" />}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Difficulty Breakdown</h4>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={difficultyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={40}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {difficultyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} problems`, "Count"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs mt-2">
                      {difficultyData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span>{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content with tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <UserIcon size={14} />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center gap-2">
                    <Shield size={14} />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center gap-2">
                    <Settings size={14} />
                    Preferences
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Update your personal information and public profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>{success}</AlertDescription>
                        </Alert>
                      )}

                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                              id="displayName"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="Your name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, Country"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Social Links</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                placeholder="GitHub URL"
                                className="pl-9"
                              />
                            </div>

                            <div className="relative">
                              <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                value={twitterUrl}
                                onChange={(e) => setTwitterUrl(e.target.value)}
                                placeholder="Twitter URL"
                                className="pl-9"
                              />
                            </div>

                            <div className="relative">
                              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="LinkedIn URL"
                                className="pl-9"
                              />
                            </div>

                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="Website URL"
                                className="pl-9"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                            {isLoading ? (
                              <>
                                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Account Tab */}
                <TabsContent value="account">
                    {isEmailPasswordUser && ( // ✅ Render only if the user signed in with email/password
                    <Card className="mb-6">
                      <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your password to keep your account secure</CardDescription>
                      </CardHeader>
                      <CardContent>
                      {error && (
                        <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                        </Alert>
                      )}

                      <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pr-10"
                          />
                          <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pr-10"
                          />
                          <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                        </div>

                        <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                          {isLoading ? (
                          <>
                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            Updating...
                          </>
                          ) : (
                          <>
                            <Key size={16} />
                            Update Password
                          </>
                          )}
                        </Button>
                        </div>
                      </form>
                      </CardContent>
                    </Card>
                    )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Account Security</CardTitle>
                      <CardDescription>Manage your account security settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Update the Account Security section to show email 2FA
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account via email verification
                          </p>
                        </div>
                        {is2FAEnabled ? (
                          <Button variant="outline" className="flex items-center gap-2" onClick={disable2FA}>
                            <Lock size={16} />
                            Disable
                          </Button>
                        ) : (
                          <Button variant="outline" className="flex items-center gap-2" onClick={setup2FA}>
                            <Lock size={16} />
                            Enable
                          </Button>
                        )}
                      </div> */}

                      {/* <Separator /> */}

                      <div className="flex items-center justify-between">
                        {/* <div className="space-y-0.5">
                          <Label className="text-base">Active Sessions</Label>
                          <p className="text-sm text-muted-foreground">
                            Manage devices where you're currently logged in
                          </p>
                        </div> */}
                        {/* <Button variant="outline" className="flex items-center gap-2">
                          <Shield size={16} />
                          Manage
                        </Button> */}
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base text-red-500">Delete Account</Label>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all your data
                          </p>
                        </div>
                        <Button variant="destructive" className="flex items-center gap-2" onClick={deleteAccount}>
                          <X size={16} />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences">
                  {/* <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="emailNotifications" className="text-base">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications about your account activity
                          </p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weeklyDigest" className="text-base">
                            Weekly Digest
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive a weekly summary of your progress and achievements
                          </p>
                        </div>
                        <Switch id="weeklyDigest" checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
                      </div>
                    </CardContent>
                  </Card> */}

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>Customize how CodeQuest Lite looks for you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger id="theme">
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="publicProfile" className="text-base">
                            Public Profile
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Make your profile visible to other CodeQuest users
                          </p>
                        </div>
                        <Switch id="publicProfile" checked={publicProfile} onCheckedChange={setPublicProfile} />
                      </div> */}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button className="flex items-center gap-2" onClick={saveUserPreferences} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Data & Privacy</CardTitle>
                      <CardDescription>Manage your data and privacy settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Download Your Data</Label>
                          <p className="text-sm text-muted-foreground">
                            Get a copy of all your data stored in CodeQuest Lite
                          </p>
                        </div>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Download size={16} />
                          Export
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Privacy Settings</Label>
                          <p className="text-sm text-muted-foreground">
                            Manage how your information is used and shared
                          </p>
                        </div>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Settings size={16} />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card> */}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Add an extra layer of security to your account by enabling two-factor authentication via email.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* {step2FA === "email" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailFor2FA">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <Input
                    id="emailFor2FA"
                    type="email"
                    value={emailFor2FA}
                    onChange={(e) => setEmailFor2FA(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
                <p className="text-sm text-muted-foreground">We'll send a verification code to this email address</p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIs2FADialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={sendVerificationEmail} disabled={isLoading || !emailFor2FA}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                />
                <p className="text-sm text-muted-foreground">Enter the 6-digit verification code sent to your email</p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep2FA("email")}>
                  Back
                </Button>
                <Button onClick={verifyAndEnroll} disabled={isLoading || !verificationCode}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable 2FA"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )} */}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProfilePage

