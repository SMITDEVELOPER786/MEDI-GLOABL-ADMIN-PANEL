"use client"

import { useState, useEffect } from "react"
import AdminPanel from "@/components/admin-panel"
import AdminLogin from "@/components/admin-login"

const ADMIN_CREDENTIALS = {
  email: "admin@medicalplatform.com",
  password: "admin123456",
}

interface LoginResult {
  success: boolean
  error?: string
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
        console.error(error)
      }
    }
    setInitialLoading(false)
  }, [])

  const handleLogin = async (
    credentials: { email: string; password: string }
  ): Promise<LoginResult> => {
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (
      credentials.email === ADMIN_CREDENTIALS.email &&
      credentials.password === ADMIN_CREDENTIALS.password
    ) {
      const session = {
        email: credentials.email,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem("adminSession", JSON.stringify(session))

      setIsAuthenticated(true)

      setLoading(false)
      return { success: true }
    } else {
      setLoading(false)
      return { success: false, error: "Invalid email or password" }
    }
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
