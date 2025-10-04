"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Users,
  UserCheck,
  Calendar,
  Package,
  MessageSquare,
  Eye,
  Check,
  X,
  Clock,
  RefreshCw,
  Search,
  Filter,
  User,
  Stethoscope,
  ShoppingCart,
  Lightbulb,
  Trash2,
  LogOut,
  Activity,
  TrendingUp,
  Star,
  Zap,
  Ban,
  TableOfContentsIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  getAllUsers,
  getAllConsultantApplications,
  updateConsultantApplicationStatus,
  getAllConsultationBookings,
  updateBookingStatus,
  getAllSupplierDevices,
  updateDeviceStatus,
  getAllFeedback,
  updateFeedbackStatus,
  getAllOrders,
  updateOrderStatus,
} from "@/lib/firebase"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore"
import AdminChatPanel from "./AdminChatPanel"
import AdminDeviceOfWeek from "./AdminDeviceWeek"
import AdminHomeContent from "./AdminHomeContent"

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // State for all data
  const [consultantApplications, setConsultantApplications] = useState([])
  const [consultationBookings, setConsultationBookings] = useState([])
  const [supplierDevices, setSupplierDevices] = useState([])
  const [feedback, setFeedback] = useState([])
  const [orders, setOrders] = useState([])
  const [featureSuggestions, setFeatureSuggestions] = useState([])
  const [customDevices, setCustomDevices] = useState([])

  const [bookingFilterStatus, setBookingFilterStatus] = useState("all")
  const [bookingSearchTerm, setBookingSearchTerm] = useState("")
  const [filteredBookings, setFilteredBookings] = useState([])

  const getAllFeatureSuggestions = async () => {
    try {
      const q = query(collection(db, "featureSuggestions"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const suggestions = []
      querySnapshot.forEach((doc) => {
        suggestions.push({
          id: doc.id,
          ...doc.data(),
        })
      })
      return suggestions
    } catch (error) {
      console.error("Error fetching feature suggestions:", error)
      return []
    }
  }

  const handleFeatureSuggestionStatusUpdate = async (suggestionId, newStatus) => {
    try {
      console.log("[v0] Updating feature suggestion:", suggestionId, "to status:", newStatus)
      await updateDoc(doc(db, "featureSuggestions", suggestionId), {
        status: newStatus,
        updatedAt: Timestamp.now(),
      })

      // Update local state
      setFeatureSuggestions((prev) =>
        prev.map((suggestion) =>
          suggestion.id === suggestionId
            ? { ...suggestion, status: newStatus, updatedAt: Timestamp.now() }
            : suggestion,
        ),
      )

      console.log("[v0] Feature suggestion status updated successfully")
      toast.success(`Feature suggestion ${newStatus} successfully!`)
    } catch (error) {
      console.error("Error updating feature suggestion status:", error)
      toast.error("Failed to update feature suggestion status.")
    }
  }

  const getAllCustomDevices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "customDevices"))
      const customDevicesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return customDevicesData.sort(
        (a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt),
      )
    } catch (error) {
      console.error("Error fetching custom devices:", error)
      return []
    }
  }

  // Load all data
  const loadAllData = async () => {
    setLoading(true)
    try {
      const [
        usersData,
        consultantsData,
        bookingsData,
        devicesData,
        feedbackData,
        ordersData,
        suggestionsData,
        customDevicesData,
      ] = await Promise.all([
        getAllUsers(),
        getAllConsultantApplications(),
        getAllConsultationBookings(),
        getAllSupplierDevices(),
        getAllFeedback(),
        getAllOrders(),
        getAllFeatureSuggestions(),
        getAllCustomDevices(),
      ])

      setUsers(usersData)
      setConsultantApplications(consultantsData)
      setConsultationBookings(bookingsData)
      setSupplierDevices(devicesData)
      setFeedback(feedbackData)
      setOrders(ordersData)
      setFeatureSuggestions(suggestionsData)
      setCustomDevices(customDevicesData)
    } catch (error) {
      toast.error("Failed to load data from Database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    filterBookings()
  }, [consultationBookings, bookingFilterStatus, bookingSearchTerm])

  const filterBookings = () => {
    let filtered = consultationBookings

    if (bookingFilterStatus !== "all") {
      filtered = filtered.filter((booking) => booking.status === bookingFilterStatus)
    }

    if (bookingSearchTerm) {
      filtered = filtered.filter(
        (booking) =>
          (booking.clientName || booking.name || "").toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
          (booking.email || "").toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
          (booking.serviceType || booking.consultationType || "")
            .toLowerCase()
            .includes(bookingSearchTerm.toLowerCase()),
      )
    }

    setFilteredBookings(filtered)
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
    toast({
      title: "Success",
      description: "Data refreshed successfully!",
    })
  }

  const handleLogout = () => {
    // Clear any stored admin session data
    localStorage.removeItem("adminSession")
    // Trigger parent component to show login again
    window.location.reload()
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const updateUserStatus = async (userId, status) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        status: status,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      throw error
    }
  }

  const deleteUser = async (userId) => {
    try {
      const userRef = doc(db, "users", userId)
      await deleteDoc(userRef)
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }

  // Status update handlers
  const handleUserStatusUpdate = async (userId, status) => {
    try {
      await updateUserStatus(userId, status)
      setUsers(users.map((user) => (user.id === userId ? { ...user, status } : user)))
      toast({
        title: "Success",
        // description: `User ${status === "approved" ? "approved" : "rejected"} successfully!`,
        description: `User ${status === "approved" ? "approved" : status === "disabled" ? "disabled" : "rejected"} successfully!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId)
      setUsers(users.filter((user) => user.id !== userId))
      toast({
        title: "Success",
        description: "User deleted successfully!",
      })
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      })
    }
  }

  const openDeleteDialog = (user) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete.id)
    }
  }

  const handleConsultantStatusUpdate = async (applicationId, status) => {
    try {
      await updateConsultantApplicationStatus(applicationId, status)
      setConsultantApplications(
        consultantApplications.map((app) => (app.id === applicationId ? { ...app, status } : app)),
      )
      toast({
        title: "Success",
        description: `Consultant application ${status} successfully!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update consultant application status.",
        variant: "destructive",
      })
    }
  }

  const handleBookingStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status)
      setConsultationBookings(
        consultationBookings.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)),
      )
      toast({
        title: "Success",
        description: `Booking ${status} successfully!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      })
    }
  }

  const handleDeviceStatusUpdate = async (device, status) => {
    try {
      await updateDeviceStatus(device, status)
      setSupplierDevices(supplierDevices.map((d) => (d.id === device.id ? { ...d, status } : d)))
      toast({
        title: "Success",
        description: `Device ${status === "approved" ? "approved" : "rejected"} successfully!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update device status.",
        variant: "destructive",
      })
    }
  }

  const handleFeedbackStatusUpdate = async (feedbackId, status) => {
    try {
      await updateFeedbackStatus(feedbackId, status)
      setFeedback(feedback.map((fb) => (fb.id === feedbackId ? { ...fb, status } : fb)))
      toast({
        title: "Success",
        description: `Feedback ${status === "approved" ? "approved" : "rejected"} successfully!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feedback status.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: Clock },
      "not-approved": { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: Check },
      rejected: { variant: "destructive", icon: X },
      accepted: { variant: "default", icon: Check },
      processing: { variant: "secondary", icon: Clock },
      shipped: { variant: "default", icon: Check },
      delivered: { variant: "default", icon: Check },
      cancelled: { variant: "destructive", icon: X },
    }

    if (status === "disabled") {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Disabled</Badge>
    }

    const config = statusConfig[status] || statusConfig["pending"]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status || "pending"}
      </Badge>
    )
  }

  const getBookingStats = () => {
    const total = consultationBookings.length
    const pending = consultationBookings.filter((b) => !b.status || b.status === "pending").length
    const accepted = consultationBookings.filter((b) => b.status === "accepted").length
    const rejected = consultationBookings.filter((b) => b.status === "rejected").length
    return { total, pending, accepted, rejected }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const handleDeleteDocument = async (collectionName, documentId) => {
    try {
      const docRef = doc(db, collectionName, documentId)
      await updateDoc(docRef, {
        status: "deleted",
        updatedAt: Timestamp.now(),
      })

      if (collectionName === "customDevices") {
        setCustomDevices((prev) => prev.filter((device) => device.id !== documentId))
      }

      toast.success("Document deleted successfully!")
    } catch (error) {
      console.error("Error deleting document:", error)
      toast.error("Failed to delete document.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
              <RefreshCw className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-2xl animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            Loading Admin Panel
          </h2>
          <p className="text-gray-600 text-lg">Preparing your dashboard...</p>
        </div>
      </div>
    )
  }

  const bookingStats = getBookingStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-xl">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-blue-100 text-lg">Comprehensive platform management and analytics</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={refreshData}
                disabled={refreshing}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-red-500/10 border-red-300/30 text-red-100 hover:bg-red-500/20 backdrop-blur-sm transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 lg:p-6 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          {/* Total Users */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-lg hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Users</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {users.length}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {users.filter((u) => u.status === "not-approved").length} pending approval
              </p>
            </CardContent>
          </Card>

          {/* Consultant Applications */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/50 border-0 shadow-lg hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Consultant Apps</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                {consultantApplications.length}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {consultantApplications.filter((a) => a.status === "pending").length} pending review
              </p>
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/50 border-0 shadow-lg hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Bookings</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {consultationBookings.length}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {consultationBookings.filter((b) => b.status === "pending").length} pending approval
              </p>
            </CardContent>
          </Card>

          {/* Devices */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-orange-50/50 border-0 shadow-lg hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Devices</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                {supplierDevices.length}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {supplierDevices.filter((d) => !d.status || d.status === "pending").length} pending approval
              </p>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-green-50/50 border-0 shadow-lg hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Orders</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                {orders.length}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {orders.filter((o) => !o.status || o.status === "pending").length} pending approval
              </p>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-pink-50/50 border-0 shadow-lg hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Feedback</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
                {feedback.length}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Star className="w-3 h-3" />
                {feedback.filter((f) => !f.status || f.status === "pending").length} pending review
              </p>
            </CardContent>
          </Card>

          {/* Suggested Features */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-yellow-50/50 border-0 shadow-lg hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Feature Ideas</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                {featureSuggestions.length}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {featureSuggestions.filter((f) => !f.status || f.status === "pending").length} pending review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <Tabs defaultValue="users" className="space-y-0">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50">
              <div className="overflow-x-auto px-6 py-2">
                <TabsList className="grid w-full grid-cols-10 min-w-[900px] lg:min-w-0 bg-transparent h-14 gap-1">
                  <TabsTrigger
                    value="users"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg data-[state=active]:border-blue-200 rounded-xl transition-all duration-300"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger
                    value="consultants"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-lg data-[state=active]:border-emerald-200 rounded-xl transition-all duration-300"
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Consultants
                  </TabsTrigger>
                  <TabsTrigger
                    value="bookings"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:border-purple-200 rounded-xl transition-all duration-300"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Bookings
                  </TabsTrigger>
                  <TabsTrigger
                    value="devices"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg data-[state=active]:border-orange-200 rounded-xl transition-all duration-300"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Devices
                  </TabsTrigger>
                  <TabsTrigger value="device-of-week">
                    <Star className="w-4 h-4 mr-1" />
                    Device of Week
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-lg data-[state=active]:border-green-200 rounded-xl transition-all duration-300"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger
                    value="feedback"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-lg data-[state=active]:border-pink-200 rounded-xl transition-all duration-300"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Feedback
                  </TabsTrigger>
                  <TabsTrigger
                    value="features"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-lg data-[state=active]:border-yellow-200 rounded-xl transition-all duration-300"
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Features
                  </TabsTrigger>
                 <TabsTrigger
                    value="content"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-lg data-[state=active]:border-yellow-200 rounded-xl transition-all duration-300"
                  >
                    <TableOfContentsIcon className="w-4 h-4 mr-1" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="chats"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg data-[state=active]:border-indigo-200 rounded-xl transition-all duration-300"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Chats
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">

              <TabsContent value="device-of-week">
                  <AdminDeviceOfWeek />
                </TabsContent>
              {/* Users Tab */}
              <TabsContent value="users" className="mt-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-blue-200/30">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-600" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 hover:bg-gray-50/80">
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Name</TableHead>
                            <TableHead className="min-w-[180px] font-semibold text-gray-700">Email</TableHead>
                            <TableHead className="min-w-[80px] font-semibold text-gray-700">Role</TableHead>
                            <TableHead className="min-w-[100px] font-semibold text-gray-700">Country</TableHead>
                            <TableHead className="min-w-[80px] font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="min-w-[100px] font-semibold text-gray-700">Created</TableHead>
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-16">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                  <Package className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">No custom device requests</h3>
                                <p className="text-gray-600">No custom device requests found</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            users.map((user) => (
                              <TableRow key={user.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                                <TableCell className="font-medium text-gray-800">{`${user.firstName} ${user.lastName}`}</TableCell>
                                <TableCell className="text-gray-600">{user.email}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-600">{user.country}</TableCell>
                                <TableCell>{getStatusBadge(user.status)}</TableCell>
                                <TableCell className="text-gray-500 text-sm">{formatDate(user.createdAt)}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-transparent"
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span className="sr-only">View details</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl mx-4 bg-gradient-to-br from-white to-blue-50/30">
                                        <DialogHeader>
                                          <DialogTitle className="text-2xl font-bold text-gray-800">
                                            User Details
                                          </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-96">
                                          <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                              <div className="space-y-3">
                                                <div className="p-3 bg-blue-50/50 rounded-xl">
                                                  <label className="text-sm font-semibold text-blue-800">Name</label>
                                                  <p className="text-gray-800">{`${user.firstName} ${user.lastName}`}</p>
                                                </div>
                                                <div className="p-3 bg-blue-50/50 rounded-xl">
                                                  <label className="text-sm font-semibold text-blue-800">Email</label>
                                                  <p className="text-gray-800">{user.email}</p>
                                                </div>
                                                <div className="p-3 bg-blue-50/50 rounded-xl">
                                                  <label className="text-sm font-semibold text-blue-800">Phone</label>
                                                  <p className="text-gray-800">{user.phoneNumber}</p>
                                                </div>
                                                <div className="p-3 bg-blue-50/50 rounded-xl">
                                                  <label className="text-sm font-semibold text-blue-800">Role</label>
                                                  <p className="text-gray-800">{user.role}</p>
                                                </div>
                                              </div>
                                              <div className="space-y-3">
                                                <div className="p-3 bg-blue-50/50 rounded-xl">
                                                  <label className="text-sm font-semibold text-blue-800">Country</label>
                                                  <p className="text-gray-800">{user.country}</p>
                                                </div>
                                                <div className="p-3 bg-blue-50/50 rounded-xl">
                                                  <label className="text-sm font-semibold text-blue-800">City</label>
                                                  <p className="text-gray-800">{user.city}</p>
                                                </div>
                                                <div className="p-3 bg-blue-50/50 rounded-xl">
                                                  <label className="text-sm font-semibold text-blue-800">Address</label>
                                                  <p className="text-gray-800">{user.address}</p>
                                                </div>
                                                <div className="p-3 bg-blue-50/50 rounded-xl">
                                                  <label className="text-sm font-semibold text-blue-800">
                                                    Zip Code
                                                  </label>
                                                  <p className="text-gray-800">{user.zipCode}</p>
                                                </div>
                                              </div>
                                            </div>
                                            {user.verificationFileUrl && (
                                              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                                <label className="text-sm font-semibold text-blue-800">
                                                  Verification File
                                                </label>
                                                <a
                                                  href={user.verificationFileUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:text-blue-800 hover:underline ml-2 break-all transition-colors duration-200"
                                                >
                                                  {user.verificationFileName || "View File"}
                                                </a>
                                              </div>
                                            )}

                                            {user.role === "Researcher/Supplier" && user.supplierDocuments && (
                                              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                                <h4 className="font-semibold text-gray-700 mb-2">
                                                  Supplier Documents:
                                                </h4>

                                                {user.supplierDocuments.companyRegistrationUrl && (
                                                  <div className="mb-2">
                                                    <strong>Company Registration Certificate:</strong>
                                                    <a
                                                      href={user.supplierDocuments.companyRegistrationUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-blue-600 hover:text-blue-800 hover:underline ml-2 break-all transition-colors duration-200"
                                                    >
                                                      {user.supplierDocuments.companyRegistrationName ||
                                                        "View Certificate"}
                                                    </a>
                                                  </div>
                                                )}

                                                {user.supplierDocuments.internationalCertUrl && (
                                                  <div className="mb-2">
                                                    <strong>International Certificate:</strong>
                                                    <a
                                                      href={user.supplierDocuments.internationalCertUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-blue-600 hover:text-blue-800 hover:underline ml-2 break-all transition-colors duration-200"
                                                    >
                                                      {user.supplierDocuments.internationalCertName ||
                                                        "View Certificate"}
                                                    </a>
                                                  </div>
                                                )}

                                                {user.supplierDocuments.importLicenseUrl && (
                                                  <div className="mb-2">
                                                    <strong>Import/Distribution License:</strong>
                                                    <a
                                                      href={user.supplierDocuments.importLicenseUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-blue-600 hover:text-blue-800 hover:underline ml-2 break-all transition-colors duration-200"
                                                    >
                                                      {user.supplierDocuments.importLicenseName || "View License"}
                                                    </a>
                                                  </div>
                                                )}

                                                {user.supplierDocuments.mediGlobalAgreementUrl && (
                                                  <div className="mb-2">
                                                    <strong>MediGlobal Supplier Agreement:</strong>
                                                    <a
                                                      href={user.supplierDocuments.mediGlobalAgreementUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-blue-600 hover:text-blue-800 hover:underline ml-2 break-all transition-colors duration-200"
                                                    >
                                                      {user.supplierDocuments.mediGlobalAgreementName ||
                                                        "View Agreement"}
                                                    </a>
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                            {user.role === "Other" && user.otherDocuments && (
                                              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                                <h4 className="font-semibold text-gray-700 mb-2">Other Documents:</h4>

                                                {user.otherDocuments.idDocUrl && (
                                                  <div className="mb-2">
                                                    <strong>ID Document (ID Card/Passport):</strong>
                                                    <a
                                                      href={user.otherDocuments.idDocUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-blue-600 hover:text-blue-800 hover:underline ml-2 break-all transition-colors duration-200"
                                                    >
                                                      {user.otherDocuments.idDocName || "View ID Document"}
                                                    </a>
                                                  </div>
                                                )}

                                                {user.otherDocuments.certificateUrl && (
                                                  <div className="mb-2">
                                                    <strong>Certificate:</strong>
                                                    <a
                                                      href={user.otherDocuments.certificateUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-blue-600 hover:text-blue-800 hover:underline ml-2 break-all transition-colors duration-200"
                                                    >
                                                      {user.otherDocuments.certificateName || "View Certificate"}
                                                    </a>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </ScrollArea>
                                      </DialogContent>
                                    </Dialog>
                                    {/* {user.status === "not-approved" && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleUserStatusUpdate(user.id, "approved")}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                      >
                                        <Check className="w-4 h-4" />
                                        <span className="sr-only">Approve</span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleUserStatusUpdate(user.id, "rejected")}
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                      >
                                        <X className="w-4 h-4" />
                                        <span className="sr-only">Reject</span>
                                      </Button>
                                    </>
                                  )} */}
                                    {user.status === "not-approved" && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleUserStatusUpdate(user.id, "approved")}
                                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                          <Check className="w-4 h-4" />
                                          <span className="sr-only">Approve</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleUserStatusUpdate(user.id, "rejected")}
                                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                          <X className="w-4 h-4" />
                                          <span className="sr-only">Reject</span>
                                        </Button>
                                      </>
                                    )}
                                    {user.status === "approved" && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleUserStatusUpdate(user.id, "disabled")}
                                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                          <Ban className="w-4 h-4" />
                                          <span className="sr-only">Disable</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => openDeleteDialog(user)}
                                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          <span className="sr-only">Delete</span>
                                        </Button>
                                      </>
                                    )}
                                    {user.status === "disabled" && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleUserStatusUpdate(user.id, "approved")}
                                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                          <Check className="w-4 h-4" />
                                          <span className="sr-only">Re-enable</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => openDeleteDialog(user)}
                                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          <span className="sr-only">Delete</span>
                                        </Button>
                                      </>
                                    )}
                                    {user.status === "rejected" && (
                                      <Button
                                        size="sm"
                                        onClick={() => openDeleteDialog(user)}
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Consultant Applications Tab */}
              <TabsContent value="consultants" className="mt-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
                  <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-b border-emerald-200/30">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <UserCheck className="w-6 h-6 text-emerald-600" />
                      Consultant Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 hover:bg-gray-50/80">
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Name</TableHead>
                            <TableHead className="min-w-[180px] font-semibold text-gray-700">Email</TableHead>
                            <TableHead className="min-w-[140px] font-semibold text-gray-700">Specialization</TableHead>
                            <TableHead className="min-w-[80px] font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="min-w-[100px] font-semibold text-gray-700">Applied</TableHead>
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {consultantApplications.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-16">
                                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-b border-emerald-200/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                  <UserCheck className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">No Consultation Applications</h3>
                                <p className="text-gray-600">No Consultant Applications requests found</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            consultantApplications.map((application) => (
                              <TableRow
                                key={application.id}
                                className="hover:bg-emerald-50/50 transition-colors duration-200"
                              >
                                <TableCell className="font-medium text-gray-800">{application.fullName}</TableCell>
                                <TableCell className="text-gray-600">{application.email}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                  >
                                    {application.specialization}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(application.status)}</TableCell>
                                <TableCell className="text-gray-500 text-sm">
                                  {formatDate(application.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 bg-transparent"
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span className="sr-only">View details</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl mx-4 bg-gradient-to-br from-white to-emerald-50/30">
                                        <DialogHeader>
                                          <DialogTitle className="text-2xl font-bold text-gray-800">
                                            Consultant Application Details
                                          </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-96">
                                          <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                              <div className="p-3 bg-emerald-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-emerald-800">Name</label>
                                                <p className="text-gray-800">{application.fullName}</p>
                                              </div>
                                              <div className="p-3 bg-emerald-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-emerald-800">Email</label>
                                                <p className="text-gray-800">{application.email}</p>
                                              </div>
                                              <div className="p-3 bg-emerald-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-emerald-800">Phone</label>
                                                <p className="text-gray-800">{application.phoneNumber}</p>
                                              </div>
                                              <div className="p-3 bg-emerald-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-emerald-800">
                                                  Specialization
                                                </label>
                                                <p className="text-gray-800">{application.specialization}</p>
                                              </div>
                                              <div className="p-3 bg-emerald-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-emerald-800">Bio</label>
                                                <p className="text-gray-800">{application.shortBio}</p>
                                              </div>
                                              <div className="p-3 bg-emerald-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-emerald-800">
                                                  Membership Fee
                                                </label>
                                                <p className="text-gray-800">${application.membershipFee}</p>
                                              </div>
                                              {application.profilePictureUrl && (
                                                <div className="mb-2 p-3 bg-emerald-50/50 rounded-xl">
                                                  <strong className="text-sm font-semibold text-emerald-800">
                                                    Profile Picture:
                                                  </strong>
                                                  <a
                                                    href={application.profilePictureUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-800 text-md hover:underline ml-2 break-all"
                                                  >
                                                    View Profile
                                                  </a>
                                                </div>
                                              )}

                                              {application.resumeCvUrl && (
                                                <div className="mb-2 p-3 bg-emerald-50/50 rounded-xl">
                                                  <strong className="text-sm font-semibold text-emerald-800">
                                                    Resume:
                                                  </strong>
                                                  <a
                                                    href={application.resumeCvUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-800 hover:underline ml-2 break-all"
                                                  >
                                                    View Resume/CV
                                                  </a>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </ScrollArea>
                                      </DialogContent>
                                    </Dialog>
                                    {application.status === "pending" && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleConsultantStatusUpdate(application.id, "approved")}
                                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                          <Check className="w-4 h-4" />
                                          <span className="sr-only">Approve</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleConsultantStatusUpdate(application.id, "rejected")}
                                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                          <X className="w-4 h-4" />
                                          <span className="sr-only">Reject</span>
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Consultation Bookings Tab */}
              <TabsContent value="bookings" className="mt-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
                  <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-b border-purple-200/30">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-purple-600" />
                      Consultation Bookings
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">Manage and track all consultation requests</p>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-700">{bookingStats.total}</div>
                          <div className="text-xs text-blue-600 font-medium">Total Requests</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-amber-700">{bookingStats.pending}</div>
                          <div className="text-xs text-amber-600 font-medium">Pending</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-emerald-700">{bookingStats.accepted}</div>
                          <div className="text-xs text-emerald-600 font-medium">Accepted</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl border border-red-200/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                          <X className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-700">{bookingStats.rejected}</div>
                          <div className="text-xs text-red-600 font-medium">Rejected</div>
                        </div>
                      </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="Search by name, email, or service type..."
                          value={bookingSearchTerm}
                          onChange={(e) => setBookingSearchTerm(e.target.value)}
                          className="pl-12 h-12 bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <div className="flex gap-2 overflow-x-auto">
                          {["all", "pending", "accepted", "rejected"].map((status) => (
                            <Button
                              key={status}
                              variant={bookingFilterStatus === status ? "default" : "outline"}
                              size="sm"
                              onClick={() => setBookingFilterStatus(status)}
                              className={`capitalize whitespace-nowrap rounded-xl transition-all duration-300 ${
                                bookingFilterStatus === status
                                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg border-0"
                                  : "hover:bg-purple-50 hover:border-purple-300"
                              }`}
                            >
                              {status}
                              {status !== "all" && (
                                <Badge variant="secondary" className="ml-2 text-xs bg-white/20 text-inherit border-0">
                                  {status === "pending" && bookingStats.pending}
                                  {status === "accepted" && bookingStats.accepted}
                                  {status === "rejected" && bookingStats.rejected}
                                </Badge>
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bookings List */}
                    <div className="space-y-4">
                      {filteredBookings.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/30">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <MessageSquare className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-3">No bookings found</h3>
                          <p className="text-gray-600">No consultation requests match your current filters.</p>
                        </div>
                      ) : (
                        filteredBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="border-0 rounded-2xl p-6 bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl transition-all duration-300 shadow-lg hover:scale-[1.02] border-purple-200/20"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                  <span className="text-white font-bold text-lg">
                                    {(booking.clientName || booking.name || "")
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-xl text-gray-800 truncate">
                                    {booking.clientName || booking.name}
                                  </h3>
                                  <p className="text-gray-600 truncate text-lg">{booking.email}</p>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                {getStatusBadge(booking.status)}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full sm:w-auto bg-white/80 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 rounded-xl"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl mx-4 bg-gradient-to-br from-white to-purple-50/30">
                                    <DialogHeader>
                                      <DialogTitle className="text-2xl font-bold text-gray-800">
                                        Booking Details
                                      </DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="max-h-96">
                                      <div className="space-y-6">
                                        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/30">
                                          <h4 className="font-bold mb-3 flex items-center gap-2 text-purple-800">
                                            <User className="w-5 h-5" />
                                            Client Information
                                          </h4>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                              <label className="text-sm font-semibold text-purple-700">Name</label>
                                              <p className="text-gray-800">{booking.clientName || booking.name}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-semibold text-purple-700">Email</label>
                                              <p className="text-gray-800 break-all">{booking.email}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-semibold text-purple-700">Phone</label>
                                              <p className="text-gray-800">{booking.phone || "Not provided"}</p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/30">
                                          <h4 className="font-bold mb-3 flex items-center gap-2 text-purple-800">
                                            <Stethoscope className="w-4 h-4" />
                                            Consultation Details
                                          </h4>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                              <label className="text-sm font-semibold text-purple-700">
                                                Service Type
                                              </label>
                                              <p>{booking.serviceType || "Consultation"}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-semibold text-purple-700">Specialty</label>
                                              <p>{booking.specialty || "Not specified"}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-semibold text-purple-700">
                                                Assigned Engineer
                                              </label>
                                              <p>{booking.engineerName || "Not assigned"}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-semibold text-purple-700">
                                                Preferred Date
                                              </label>
                                              <p>{booking.preferredDate || "Not specified"}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-semibold text-purple-700">
                                                Preferred Time
                                              </label>
                                              <p>{booking.preferredTime || "Not specified"}</p>
                                            </div>
                                            {booking.engineerId && (
                                              <div>
                                                <label className="text-sm font-semibold text-purple-700">
                                                  Engineer ID
                                                </label>
                                                <p>{booking.engineerId}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {booking.message && (
                                          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/30">
                                            <h4 className="font-bold mb-3 flex items-center gap-2 text-purple-800">
                                              <MessageSquare className="w-4 h-4" />
                                              Requirments / Message
                                            </h4>
                                            <div className="p-3 bg-gray-100 rounded-md">
                                              <p className="break-words">{booking.message}</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </ScrollArea>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl">
                                <Stethoscope className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                <span className="truncate text-gray-700 font-medium">
                                  {booking.serviceType || booking.consultationType}
                                </span>
                              </div>
                              {booking.preferredDate && (
                                <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl">
                                  <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                  <span className="text-gray-700 font-medium">{booking.preferredDate}</span>
                                </div>
                              )}
                              {booking.preferredTime && (
                                <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl">
                                  <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                  <span className="text-gray-700 font-medium">{booking.preferredTime}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl">
                                <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                <span className="text-gray-700 font-medium">
                                  {formatDate(booking.createdAt || booking.timestamp)}
                                </span>
                              </div>
                            </div>

                            {(!booking.status || booking.status === "pending") && (
                              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-purple-200/30">
                                <Button
                                  size="sm"
                                  onClick={() => handleBookingStatusUpdate(booking.id, "accepted")}
                                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl w-full sm:w-auto"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Accept Booking
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleBookingStatusUpdate(booking.id, "rejected")}
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl w-full sm:w-auto"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Reject Booking
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="devices" className="mt-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30">
                  <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-200/30">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <Package className="w-6 h-6 text-orange-600" />
                      Supplier Devices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      {supplierDevices.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200/30">
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Package className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-3">No devices found</h3>
                          <p className="text-gray-600">No supplier devices are available at the moment.</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/80">
                              <TableHead className="min-w-[140px] font-semibold text-gray-700">Device Name</TableHead>
                              <TableHead className="min-w-[120px] font-semibold text-gray-700">Company</TableHead>
                              <TableHead className="min-w-[100px] font-semibold text-gray-700">Category</TableHead>
                              <TableHead className="min-w-[80px] font-semibold text-gray-700">Type</TableHead>
                              <TableHead className="min-w-[80px] font-semibold text-gray-700">Status</TableHead>
                              <TableHead className="min-w-[100px] font-semibold text-gray-700">Submitted</TableHead>
                              <TableHead className="min-w-[120px] font-semibold text-gray-700">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {supplierDevices.map((device) => (
                              <TableRow
                                key={device.id}
                                className="hover:bg-orange-50/50 transition-colors duration-200"
                              >
                                <TableCell className="font-medium text-gray-800">{device.deviceName}</TableCell>
                                <TableCell className="text-gray-600">{device.companyName}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    {device.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                    {device.type === "suppliers_basic"
                                      ? "basic"
                                      : device.type === "suppliers_premium"
                                        ? "premium"
                                        : device.type || "basic"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(device.status)}</TableCell>
                                <TableCell className="text-gray-500 text-sm">{formatDate(device.timestamp)}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-2">
                                    {/* View details dialog */}
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 rounded-xl bg-transparent"
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span className="sr-only">View details</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl mx-4 bg-gradient-to-br from-white to-orange-50/30">
                                        <DialogHeader>
                                          <DialogTitle className="text-2xl font-bold text-gray-800">
                                            Device Details
                                          </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-96">
                                          <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                              <div className="p-3 bg-orange-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-orange-800">
                                                  Device Name
                                                </label>
                                                <p className="text-gray-800">{device.deviceName}</p>
                                              </div>
                                              <div className="p-3 bg-orange-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-orange-800">Company</label>
                                                <p className="text-gray-800">{device.companyName}</p>
                                              </div>
                                              <div className="p-3 bg-orange-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-orange-800">
                                                  Category
                                                </label>
                                                <p className="text-gray-800">{device.category}</p>
                                              </div>
                                              <div className="p-3 bg-orange-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-orange-800">Type</label>
                                                <p className="text-gray-800">
                                                  {device.type === "suppliers_basic"
                                                    ? "basic"
                                                    : device.type === "suppliers_premium"
                                                      ? "premium"
                                                      : device.type || "basic"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Basic Specifications */}
                                          {device.specifications && (
                                            <div className="mt-6 space-y-4">
                                              <h3 className="text-lg font-semibold text-orange-800">
                                                Basic Specifications
                                              </h3>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {Object.entries(device.specifications).map(([key, value]) => (
                                                  <div key={key} className="p-3 bg-orange-50/50 rounded-xl">
                                                    <label className="text-sm font-semibold text-orange-800 capitalize">
                                                      {key}
                                                    </label>
                                                    {key === "image" ? (
                                                      <div className="mt-2 flex flex-col items-start">
                                                        <img
                                                          src={String(value) || "/placeholder.svg"}
                                                          alt="Device"
                                                          className="w-full max-w-[200px] h-auto rounded-lg shadow-md border"
                                                        />
                                                        <a
                                                          href={String(value)}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="inline-block mt-2 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition"
                                                        >
                                                          View Image
                                                        </a>
                                                      </div>
                                                    ) : (
                                                      <p className="text-gray-800">{String(value)}</p>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Detailed Specifications */}
                                          {(device.basicSpecifications || device.detailedSpecifications) && (
                                            <div className="mt-6 space-y-4">
                                              <h3 className="text-lg font-semibold text-orange-800">
                                                Detailed Specifications
                                              </h3>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Basic Specifications */}
                                                {device.basicSpecifications &&
                                                  Object.entries(device.basicSpecifications).map(([key, value]) => (
                                                    <div key={key} className="p-3 bg-orange-50/50 rounded-xl">
                                                      <label className="text-sm font-semibold text-orange-800 capitalize">
                                                        {key}
                                                      </label>
                                                      {key === "image" ? (
                                                        <div className="mt-2 flex flex-col items-start">
                                                          <img
                                                            src={String(value) || "/placeholder.svg"}
                                                            alt="Device"
                                                            className="w-full max-w-[200px] h-auto rounded-lg shadow-md border"
                                                          />
                                                          <a
                                                            href={String(value)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block mt-2 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition"
                                                          >
                                                            View Image
                                                          </a>
                                                        </div>
                                                      ) : (
                                                        <p className="text-gray-800">{String(value)}</p>
                                                      )}
                                                    </div>
                                                  ))}

                                                {/* Detailed Specifications */}
                                                {device.detailedSpecifications &&
                                                  device.detailedSpecifications.map((spec, index) => (
                                                    <div
                                                      key={`detailed-${index}`}
                                                      className="p-3 bg-orange-50/50 rounded-xl"
                                                    >
                                                      <label className="text-sm font-semibold text-orange-800">
                                                        {spec.category}
                                                      </label>
                                                      <p className="text-gray-800">{spec.value}</p>
                                                    </div>
                                                  ))}
                                              </div>
                                            </div>
                                          )}
                                        </ScrollArea>
                                      </DialogContent>
                                    </Dialog>

                                    {/* Approve / Reject Buttons */}
                                    {(!device.status || device.status === "pending") && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleDeviceStatusUpdate(device, "approved")}
                                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                                        >
                                          <Check className="w-4 h-4" />
                                          <span className="sr-only">Approve</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleDeviceStatusUpdate(device, "rejected")}
                                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                                        >
                                          <X className="w-4 h-4" />
                                          <span className="sr-only">Reject</span>
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
                  <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-b border-green-200/30">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                      Orders Management
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">View and manage customer orders</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 hover:bg-gray-50/80">
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Order ID</TableHead>
                            <TableHead className="min-w-[140px] font-semibold text-gray-700">Customer</TableHead>
                            <TableHead className="min-w-[180px] font-semibold text-gray-700">Email</TableHead>
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Phone</TableHead>
                            <TableHead className="min-w-[100px] font-semibold text-gray-700">Total</TableHead>
                            <TableHead className="min-w-[100px] font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Order Date</TableHead>
                            <TableHead className="min-w-[140px] font-semibold text-gray-700">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500/10 to-green-600/10 border-b border-green-200/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                  <ShoppingCart className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">No Orders</h3>
                                <p className="text-gray-600">No Orders found</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            orders.map((order) => (
                              <TableRow key={order.id} className="hover:bg-green-50/50 transition-colors duration-200">
                                <TableCell className="font-bold text-green-700">#{order.id.slice(-8)}</TableCell>
                                <TableCell className="font-medium text-gray-800">{order.fullName}</TableCell>
                                <TableCell className="text-gray-600">{order.email}</TableCell>
                                <TableCell className="text-gray-600">{order.phone}</TableCell>
                                <TableCell className="font-bold text-green-700 text-lg">
                                  ${order.total?.toFixed(2)}
                                </TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                <TableCell className="text-gray-500 text-sm">{formatDate(order.createdAt)}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="hover:bg-green-50 hover:border-green-300 transition-all duration-200 rounded-xl bg-transparent"
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span className="sr-only">View details</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl mx-4 bg-gradient-to-br from-white to-green-50/30">
                                        <DialogHeader>
                                          <DialogTitle className="text-2xl font-bold text-gray-800">
                                            Order Details - #{order.id.slice(-8)}
                                          </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-96">
                                          <div className="space-y-6">
                                            <div className="grid gap-6">
                                              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/30">
                                                <h4 className="font-bold mb-3 text-green-800">Customer Information</h4>
                                                <div className="space-y-2 text-sm">
                                                  <div>
                                                    <strong>Name:</strong> {order.fullName}
                                                  </div>
                                                  <div>
                                                    <strong>Email:</strong> {order.email}
                                                  </div>
                                                  <div>
                                                    <strong>Phone:</strong> {order.phone}
                                                  </div>
                                                  <div>
                                                    <strong>Address:</strong> {order.address}
                                                  </div>
                                                  {order.address2 && (
                                                    <div>
                                                      <strong>Address 2:</strong> {order.address2}
                                                    </div>
                                                  )}
                                                  <div>
                                                    <strong>Country:</strong> {order.country}
                                                  </div>
                                                  <div>
                                                    <strong>Zip Code:</strong> {order.zipCode}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/30">
                                                <h4 className="font-bold mb-3 text-blue-800">Order Information</h4>
                                                <div className="space-y-2 text-sm">
                                                  <div>
                                                    <strong>Order ID:</strong> #{order.id.slice(-8)}
                                                  </div>
                                                  <div>
                                                    <strong>Status:</strong> {order.status}
                                                  </div>
                                                  <div>
                                                    <strong>Delivery Method:</strong> {order.deliveryMethod}
                                                  </div>
                                                  <div>
                                                    <strong>Payment Method:</strong> {order.paymentMethod}
                                                  </div>
                                                  <div>
                                                    <strong>Order Date:</strong> {formatDate(order.createdAt)}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="mb-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/30">
                                                Ordered Items
                                              </h4>
                                              <div className="space-y-2">
                                                {order.items?.map((item, index) => (
                                                  <div
                                                    key={index}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                                  >
                                                    <img
                                                      src={item.image || "/images/default-device.png"}
                                                      alt={item.name}
                                                      className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                      <div className="font-medium">{item.name}</div>
                                                      <div className="font-bold mb-3 text-green-800">
                                                        Price: ${item.price?.toFixed(2)}
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/30">
                                              <h4 className="mb-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/30">
                                                Order Summary
                                              </h4>
                                              <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                  <span>Subtotal:</span>
                                                  <span>${order.subtotal?.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span>Handling Fee:</span>
                                                  <span>${order.handlingFee?.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span>Shipping:</span>
                                                  <span>${order.shippingFee?.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-semibold text-base border-t pt-1">
                                                  <span>Total:</span>
                                                  <span>${order.total?.toFixed(2)}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </ScrollArea>
                                      </DialogContent>
                                    </Dialog>
                                    {order.status === "pending" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, "processing")}
                                          className="text-blue-600 hover:text-blue-700"
                                        >
                                          <Clock className="w-4 h-4" />
                                          <span className="sr-only">Mark as processing</span>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, "shipped")}
                                          className="text-green-600 hover:text-green-700"
                                        >
                                          <Check className="w-4 h-4" />
                                          <span className="sr-only">Mark as shipped</span>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <X className="w-4 h-4" />
                                          <span className="sr-only">Cancel order</span>
                                        </Button>
                                      </>
                                    )}

                                    {order.status === "processing" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, "shipped")}
                                          className="text-green-600 hover:text-green-700"
                                        >
                                          <Check className="w-4 h-4" />
                                          <span className="sr-only">Mark as shipped</span>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <X className="w-4 h-4" />
                                          <span className="sr-only">Cancel order</span>
                                        </Button>
                                      </>
                                    )}

                                    {order.status === "shipped" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, "delivered")}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        <Check className="w-4 h-4" />
                                        <span className="sr-only">Mark as delivered</span>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Feedback Tab */}
              <TabsContent value="feedback" className="mt-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-pink-50/30">
                  <CardHeader className="bg-gradient-to-r from-pink-500/10 to-pink-600/10 border-b border-pink-200/30">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-pink-600" />
                      User Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 hover:bg-gray-50/80">
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Name</TableHead>
                            <TableHead className="min-w-[180px] font-semibold text-gray-700">Email</TableHead>
                            <TableHead className="min-w-[140px] font-semibold text-gray-700">How Found Us</TableHead>
                            <TableHead className="min-w-[80px] font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="min-w-[100px] font-semibold text-gray-700">Submitted</TableHead>
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feedback.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-pink-500/10 to-pink-600/10 border-b border-pink-200/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                  <MessageSquare className="w-6 h-6 text-pink-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800  mb-2">No Feedbacks Found</h3>
                                <p className="text-gray-600">No Feedbacks found</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            feedback.map((fb) => (
                              <TableRow key={fb.id} className="hover:bg-pink-50/50 transition-colors duration-200">
                                <TableCell className="font-medium text-gray-800">{fb.name}</TableCell>
                                <TableCell className="text-gray-600">{fb.email}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                                    {fb.howDidYouFind}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(fb.status)}</TableCell>
                                <TableCell className="text-gray-500 text-sm">{formatDate(fb.timestamp)}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="hover:bg-pink-50 hover:border-pink-300 transition-all duration-200 rounded-xl bg-transparent"
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span className="sr-only">View details</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl mx-4 bg-gradient-to-br from-white to-pink-50/30">
                                        <DialogHeader>
                                          <DialogTitle className="text-2xl font-bold text-gray-800">
                                            Feedback Details
                                          </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-96">
                                          <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                              <div className="p-3 bg-pink-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-pink-800">Name</label>
                                                <p className="text-gray-800">{fb.name}</p>
                                              </div>
                                              <div className="p-3 bg-pink-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-pink-800">Email</label>
                                                <p className="text-gray-800">{fb.email}</p>
                                              </div>
                                              <div className="p-3 bg-pink-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-pink-800">Phone</label>
                                                <p className="text-gray-800">{fb.phone}</p>
                                              </div>
                                              <div className="p-3 bg-pink-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-pink-800">
                                                  How they found us
                                                </label>
                                                <p className="text-gray-800">{fb.howDidYouFind}</p>
                                              </div>
                                            </div>
                                            <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200/30">
                                              <label className="text-sm font-semibold text-pink-800">Feedback</label>
                                              <p className="mt-2 text-gray-800 leading-relaxed break-words">
                                                {fb.feedback}
                                              </p>
                                            </div>
                                          </div>
                                        </ScrollArea>
                                      </DialogContent>
                                    </Dialog>
                                    {(!fb.status || fb.status === "pending") && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleFeedbackStatusUpdate(fb.id, "approved")}
                                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                                        >
                                          <Check className="w-4 h-4" />
                                          <span className="sr-only">Approve</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleFeedbackStatusUpdate(fb.id, "rejected")}
                                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                                        >
                                          <X className="w-4 h-4" />
                                          <span className="sr-only">Reject</span>
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chats" className="mt-0">
                <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-lg border border-indigo-200/30 overflow-hidden">
                  <AdminChatPanel />
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-0">
                <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-lg border border-indigo-200/30 overflow-hidden">
                  <AdminHomeContent/>
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/30">
                  <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-yellow-200/30">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <Lightbulb className="w-6 h-6 text-yellow-600" />
                      Feature Suggestions Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 hover:bg-gray-50/80">
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Category</TableHead>
                            <TableHead className="min-w-[300px] font-semibold text-gray-700">Description</TableHead>
                            <TableHead className="min-w-[100px] font-semibold text-gray-700">Priority</TableHead>
                            <TableHead className="min-w-[80px] font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="min-w-[100px] font-semibold text-gray-700">Created</TableHead>
                            <TableHead className="min-w-[120px] font-semibold text-gray-700">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feedback.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-yellow-200/3 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800  mb-2">No Feature Suggestions Found</h3>
                                <p className="text-gray-600">No Feature Suggestions found</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            featureSuggestions.map((suggestion) => (
                              <TableRow
                                key={suggestion.id}
                                className="hover:bg-yellow-50/50 transition-colors duration-200"
                              >
                                <TableCell className="font-medium text-gray-800">
                                  {suggestion.featureCategory}
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    <p className="truncate text-gray-600" title={suggestion.featureDescription}>
                                      {suggestion.featureDescription}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      suggestion.priorityLevel === "high"
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : suggestion.priorityLevel === "medium"
                                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                          : "bg-gray-100 text-gray-800 border-gray-200"
                                    }
                                  >
                                    {suggestion.priorityLevel || "low"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(suggestion.status || "pending")}</TableCell>
                                <TableCell className="text-gray-500 text-sm">
                                  {formatDate(suggestion.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 rounded-xl bg-transparent"
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span className="sr-only">View details</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl mx-4 bg-gradient-to-br from-white to-yellow-50/30">
                                        <DialogHeader>
                                          <DialogTitle className="text-2xl font-bold text-gray-800">
                                            Feature Suggestion Details
                                          </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-96">
                                          <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                              <div className="p-3 bg-yellow-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-yellow-800">Title</label>
                                                <p className="text-gray-800">Feature Suggestion</p>
                                              </div>
                                              <div className="p-3 bg-yellow-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-yellow-800">
                                                  Description
                                                </label>
                                                <p className="mt-1 text-gray-700 leading-relaxed">
                                                  {suggestion.featureDescription}
                                                </p>
                                              </div>
                                              <div className="p-3 bg-yellow-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-yellow-800">
                                                  Priority
                                                </label>
                                                <p className="text-gray-800">{suggestion.priorityLevel}</p>
                                              </div>
                                              <div className="p-3 bg-yellow-50/50 rounded-xl">
                                                <label className="text-sm font-semibold text-yellow-800">
                                                  Category
                                                </label>
                                                <p className="text-gray-800">{suggestion.featureCategory}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </ScrollArea>
                                      </DialogContent>
                                    </Dialog>

                                    {suggestion.status !== "approved" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFeatureSuggestionStatusUpdate(suggestion.id, "approved")}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                                      >
                                        <Check className="w-4 h-4" />
                                        <span className="sr-only">Approve</span>
                                      </Button>
                                    )}

                                    {suggestion.status !== "rejected" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFeatureSuggestionStatusUpdate(suggestion.id, "rejected")}
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                                      >
                                        <X className="w-4 h-4" />
                                        <span className="sr-only">Reject</span>
                                      </Button>
                                    )}

                                    {suggestion.status !== "in-progress" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleFeatureSuggestionStatusUpdate(suggestion.id, "in-progress")
                                        }
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                                      >
                                        <Clock className="w-4 h-4" />
                                        <span className="sr-only">In Progress</span>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

 
            </div>
          </Tabs>
        </div>
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">{userToDelete?.name || userToDelete?.email}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


