"use client"

import type React from "react"
import ronak from "@/assets/pfp.jpeg"
import ronaldo from "@/assets/ronaldo.webp"
import doncarlo from "@/assets/carlo.webp"
import manager from "@/assets/vidyut.jpg"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Code, Heart, Github, Twitter, Linkedin, Mail, MessageSquare } from "lucide-react"

// Interactive background component (same as HomePage)
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

// Team member data
const teamMembers = [
  {
    name: "Ronak Kamboj",
    role: "Founder & Lead Developer",
    bio: "Full-stack developer with a passion for creating tools that help others learn and grow.",
    avatar: ronak,
    twitter: "https://twitter.com/ronak",
    github: "https://github.com/R7rainz",
    linkedin: "https://www.linkedin.com/in/ronak-kamboj-9781a9276",
  },
  {
    name: "Cristiano Ronaldo",
    role: "UX Designer",
    bio: "Focused on creating intuitive and accessible user experiences for developers of all skill levels.",
    avatar: ronaldo,
    twitter: "https://twitter.com/Cristiano",
    github: "https://github.com/ronaldo",
    linkedin: "https://linkedin.com/in/ronaldo",
  },
  {
    name: "Carlo Ancelloti",
    role: "Backend Engineer",
    bio: "Specializes in performance optimization and data visualization for tracking progress.",
    avatar: doncarlo,
    twitter: "https://twitter.com/carlo",
    github: "https://github.com/carlo",
    linkedin: "https://linkedin.com/in/carlo",
  },
  {
    name: "Vidyut Jammwal",
    role: "Community Manager",
    bio: "Helps users get the most out of CodeQuest Lite and gathers feedback for continuous improvement.",
    avatar: manager,
    twitter: "https://twitter.com/vidyut",
    github: "https://github.com/vidyut",
    linkedin: "https://linkedin.com/in/vidyut",
  },
]

// FAQ data
const faqItems = [
  {
    question: "What is CodeQuest Lite?",
    answer:
      "CodeQuest Lite is a simple application designed to help developers track their coding challenges and visualize their progress over time. It's perfect for anyone working through interview preparation, competitive programming, or just improving their skills.",
  },
  {
    question: "Is CodeQuest Lite free to use?",
    answer:
      "Yes! CodeQuest Lite is completely free. We believe in providing accessible tools for developers at all stages of their journey.",
  },
  {
    question: "Can I track challenges from any platform?",
    answer:
      "Absolutely. You can add challenges from LeetCode, HackerRank, CodeSignal, or any other platform. You can even add your own custom challenges.",
  },
  {
    question: "How does the progress tracking work?",
    answer:
      "When you add a challenge, you can mark its status (Not Started, In Progress, or Solved). The app then generates visualizations of your progress, including completion rates, difficulty distribution, and progress over time.",
  },
  {
    question: "Is there a mobile version available?",
    answer:
      "We're currently working on mobile apps for iOS and Android. In the meantime, the web application is fully responsive and works great on mobile browsers.",
  },
  {
    question: "How can I contribute to CodeQuest Lite?",
    answer:
      "We welcome contributions! Check out our GitHub repository to see open issues, feature requests, and contribution guidelines.",
  },
]

const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="w-full flex-1 bg-background text-foreground overflow-hidden relative">
      <ParticleBackground />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section
          className={`flex flex-col items-center text-center transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-75"></div>
            <div className="relative bg-background p-4 rounded-full">
              <Code size={48} className="text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            About CodeQuest Lite
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-muted-foreground">
            Our mission, our team, and the story behind the platform
          </p>
        </section>

        {/* Mission Section */}
        <section
          className={`mt-16 transition-all duration-1000 delay-100 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <Badge className="px-3 py-1 text-sm bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                Our Mission
              </Badge>
            </div>
            <h2 className="text-3xl font-bold text-center mb-8">Empowering Developers Through Structured Learning</h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                CodeQuest Lite was born from a simple observation: tracking progress is essential for improvement, but
                most developers lack a simple, focused tool to do so for their coding practice.
              </p>
              <p>
                We believe that consistent practice with feedback is the key to mastery. Our platform helps you
                visualize your journey, celebrate your wins, and identify areas for growth.
              </p>
              <p>
                Whether you're preparing for technical interviews, participating in competitive programming, or just
                sharpening your skills, CodeQuest Lite provides the structure and insights you need to stay motivated
                and make measurable progress.
              </p>
              <div className="flex justify-center pt-4">
                <div className="flex items-center justify-center p-4 bg-card rounded-full border border-border">
                  <Heart className="text-red-500 mr-2" size={20} />
                  <span className="text-foreground font-medium">Built with love by developers, for developers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section
          className={`mt-24 transition-all duration-1000 delay-200 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Badge className="px-3 py-1 text-sm bg-purple-500/10 text-purple-500 border-purple-500/20">
                Our Team
              </Badge>
            </div>
            <h2 className="text-3xl font-bold mb-4">Meet the Creators</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A passionate team of developers and designers committed to helping you become a better programmer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-card border border-border overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24 border-2 border-primary/20">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-center">{member.name}</CardTitle>
                  <p className="text-center text-sm text-primary">{member.role}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-center text-muted-foreground text-sm">{member.bio}</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <a href={member.twitter} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Twitter size={16} />
                        <span className="sr-only">Twitter</span>
                      </Button>
                    </a>
                    <a href={member.github} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Github size={16} />
                        <span className="sr-only">GitHub</span>
                      </Button>
                    </a>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Linkedin size={16} />
                        <span className="sr-only">LinkedIn</span>
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section
          className={`mt-24 transition-all duration-1000 delay-300 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Badge className="px-3 py-1 text-sm bg-blue-500/10 text-blue-500 border-blue-500/20">FAQ</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to know about CodeQuest Lite</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact Section */}
        <section
          className={`mt-24 mb-12 transition-all duration-1000 delay-400 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <Card className="border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="text-primary" size={24} />
                    <h3 className="text-2xl font-bold">Get in Touch</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Have questions, suggestions, or just want to say hello? We'd love to hear from you! Fill out the
                    form or reach out to us directly.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="text-muted-foreground" size={20} />
                      <span>ronakkamboj26@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Github className="text-muted-foreground" size={20} />
                      <span>github.com/R7rainz</span>
                    </div>
                  </div>
                </div>
                <div>
                  <ContactForm />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // Add state for email
  const [subject, setSubject] = useState(""); // Add state for subject
  const [message, setMessage] = useState(""); 

  const handleNameChange = (e) => setName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleSubjectChange = (e) => setSubject(e.target.value);
  const handleMessageChange = (e) => setMessage(e.target.value);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message || !name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      alert("⚠️ Please fill in all fields.");
      return;
    }


    try {
      /*
      //this is working lets goo
      const data = {
        name: "John Doe",
        email: "something@something.com",
        subject: "Hello from CodeQuest Lite",
        message: "This is a test message from CodeQuest Lite.",
      */

      const response = await fetch("http://localhost:5000/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({name, email, subject, message}), // Ensure all fields are sent
      });
      console.log(response)

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      alert("✅ Message sent successfully!");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
      alert("❌ Something went wrong. Try again later.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input id="name" placeholder="Your name" value={name} onChange={handleNameChange} />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" type="email" placeholder="Your email" onChange={handleEmailChange}/>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <Input id="subject" placeholder="How can we help?" onChange={handleSubjectChange}/>
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <Textarea id="message" placeholder="Your message" rows={4} value={message} onChange={handleMessageChange} />
      </div>
      <Button type="submit" className="w-full">Send Message</Button>
    </form>
  );
};

export default AboutPage;


