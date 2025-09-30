"use client"

import { useState, useEffect } from "react"
import AdminPanel from "@/components/admin-panel"
import AdminLogin from "@/components/admin-login"
import { toast } from "sonner";

const ADMIN_CREDENTIALS = {
  email: "admin@medicalplatform.com",
  password: "admin123456",
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession")
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession)
        // Check if session is still valid (24 hours)
        const sessionTime = new Date(session.timestamp)
        const now = new Date()
        const hoursDiff = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60)

        if (hoursDiff < 24) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem("adminSession")
        }
      } catch (error) {
        localStorage.removeItem("adminSession")
        console.log(error)
      }
    }
    setInitialLoading(false)
  }, [])

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (credentials.email === ADMIN_CREDENTIALS.email && credentials.password === ADMIN_CREDENTIALS.password) {
      // Store admin session
      const session = {
        email: credentials.email,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem("adminSession", JSON.stringify(session))

      setIsAuthenticated(true)
      toast.success("Welcome to the admin dashboard!")
    } else {
      // ✅ Sonner error toast
      toast.error("Invalid email or password. Please try again.")
    }

    setLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} loading={loading} />
  }

  return <AdminPanel />
}
