"use client"

import { useState, useEffect, useRef } from "react"
import { db } from "../lib/firebase"
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore"
import { MessageCircle, Send, Users, Clock, ArrowDown, X, Shield, Zap, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

export default function AdminChatPanel() {
  const [chatUsers, setChatUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUserName, setSelectedUserName] = useState("")
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [typingIndicator, setTypingIndicator] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    console.log("[v0] Setting up real-time listener for chats collection")

    // Listen to the chats collection in real-time
    const unsubscribe = onSnapshot(
      collection(db, "chats"),
      async (chatsSnapshot) => {
        console.log("[v0] Chats collection updated, found", chatsSnapshot.size, "chat sessions")

        const users = []

        for (const chatDoc of chatsSnapshot.docs) {
          const userId = chatDoc.id
          const chatData = chatDoc.data()
          console.log("[v0] Processing chat for user:", userId, chatData)

          try {
            if (chatData.userName && chatData.lastMessage) {
              // Get unread count by querying messages
              const messagesSnapshot = await getDocs(
                query(collection(db, "chats", userId, "messages"), orderBy("timestamp", "desc")),
              )

              const unreadCount = messagesSnapshot.docs.filter(
                (doc) => doc.data().sender === "user" && !doc.data().read,
              ).length

              console.log("[v0] User data:", {
                userId,
                userName: chatData.userName,
                lastMessage: chatData.lastMessage,
                unreadCount,
              })

              users.push({
                userId,
                userName: chatData.userName,
                lastMessage: chatData.lastMessage,
                lastMessageTime: chatData.lastMessageTime,
                unreadCount,
                isOnline: Math.random() > 0.3, // Simulated online status
              })
            }
          } catch (error) {
            console.error("[v0] Error processing messages for user", userId, ":", error)
          }
        }

        // Sort by last message time
        users.sort((a, b) => {
          if (!a.lastMessageTime) return 1
          if (!b.lastMessageTime) return -1
          return b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis()
        })

        console.log("[v0] Final users list:", users)
        setChatUsers(users)
        setLoading(false)
      },
      (error) => {
        console.error("[v0] Error listening to chats collection:", error)
        setLoading(false)
      },
    )

    return () => {
      console.log("[v0] Cleaning up chats listener")
      unsubscribe()
    }
  }, [])

  // Listen to messages for selected user
  useEffect(() => {
    if (!selectedUserId) return

    console.log("[v0] Setting up messages listener for user:", selectedUserId)

    const messagesRef = collection(db, "chats", selectedUserId, "messages")
    const q = query(messagesRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("[v0] Messages updated for user", selectedUserId, "- found", snapshot.size, "messages")

        const messageList = []
        snapshot.forEach((doc) => {
          messageList.push({
            id: doc.id,
            ...doc.data(),
          })
        })
        setMessages(messageList)
        
        // Mark user messages as read when viewing
        if (messageList.length > 0) {
          setChatUsers(prev => prev.map(user => 
            user.userId === selectedUserId 
              ? { ...user, unreadCount: 0 }
              : user
          ))
        }
      },
      (error) => {
        console.error("[v0] Error listening to messages:", error)
      },
    )

    return () => {
      console.log("[v0] Cleaning up messages listener for user:", selectedUserId)
      unsubscribe()
    }
  }, [selectedUserId])

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom && messages.length > 0)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [messages.length])

  const selectUser = (userId, userName) => {
    console.log("[v0] Selecting user:", userId, userName)
    setSelectedUserId(userId)
    setSelectedUserName(userName)
    setMessages([])
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUserId) return

    console.log("[v0] Sending admin message to user:", selectedUserId)

    // Show typing indicator
    setTypingIndicator(true)
    
    try {
      const messagesRef = collection(db, "chats", selectedUserId, "messages")
      await addDoc(messagesRef, {
        sender: "admin",
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        userName: "Admin Support",
      })

      const chatSessionRef = doc(db, "chats", selectedUserId)
      await updateDoc(chatSessionRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastSender: "admin",
      })

      setNewMessage("")
      console.log("[v0] Admin message sent successfully")
    } catch (error) {
      console.error("[v0] Error sending admin message:", error)
    } finally {
      setTimeout(() => setTypingIndicator(false), 500)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const getTotalUnreadCount = () => {
    return chatUsers.reduce((total, user) => total + user.unreadCount, 0)
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              Admin Chat Console
              <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                Loading...
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">Initializing Chat Console</p>
                  <p className="text-sm text-gray-500">Connecting to chat sessions...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white p-6">
          <CardTitle className="flex items-center gap-4 text-xl font-semibold">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                Admin Chat Console
                <Zap className="w-4 h-4 text-emerald-200" />
              </div>
              <p className="text-emerald-100 text-sm font-normal mt-1">Manage customer conversations</p>
            </div>
            <div className="flex items-center gap-3">
              {getTotalUnreadCount() > 0 && (
                <Badge className="bg-red-500 text-white border-0 animate-pulse px-3 py-1">
                  {getTotalUnreadCount()} new
                </Badge>
              )}
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                <Users className="w-3 h-3 mr-1" />
                {chatUsers.length} active
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row h-[700px] lg:h-[800px]">
            {/* Enhanced Users List */}
            <div
              className={`
              ${isMobileView && selectedUserId ? "hidden" : "flex"} 
              flex-col w-full lg:w-96 bg-gradient-to-b from-slate-50 to-slate-100/80 border-r border-slate-200/60
            `}
            >
              <div className="p-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    Active Conversations
                  </h3>
                  <Badge variant="outline" className="text-xs font-medium border-slate-300 text-slate-600">
                    {chatUsers.length}
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {chatUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium mb-2">No active conversations</p>
                    <p className="text-sm text-slate-400">New chats will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2 p-3">
                    {chatUsers.map((user, index) => (
                      <div
                        key={user.userId}
                        onClick={() => selectUser(user.userId, user.userName)}
                        className={`
                          group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 
                          transform hover:scale-[1.02] hover:shadow-lg
                          ${
                            selectedUserId === user.userId
                              ? "bg-gradient-to-r from-emerald-50 to-emerald-100/80 border-2 border-emerald-200 shadow-md"
                              : "bg-white/70 hover:bg-white border border-slate-200/60 hover:border-emerald-200"
                          }
                        `}
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className={`
                              w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm
                              ${selectedUserId === user.userId 
                                ? "from-emerald-500 to-emerald-600 shadow-lg" 
                                : "from-slate-400 to-slate-500"
                              }
                            `}>
                              {user.userName.charAt(0).toUpperCase()}
                            </div>
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-slate-800 truncate text-sm">
                                {user.userName}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {user.unreadCount > 0 && (
                                  <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 text-xs px-2 py-0.5 animate-pulse">
                                    {user.unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-slate-400 font-medium">
                                  {formatTime(user.lastMessageTime)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-slate-600 truncate leading-relaxed">
                              {user.lastMessage}
                            </p>
                            
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs text-slate-400">
                                {formatDate(user.lastMessageTime)}
                              </span>
                              {user.isOnline && (
                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  Online
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {selectedUserId === user.userId && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-2xl pointer-events-none"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Chat Messages */}
            <div
              className={`
              ${isMobileView && !selectedUserId ? "hidden" : "flex"} 
              flex-col flex-1 bg-gradient-to-b from-white to-slate-50/30 relative
            `}
            >
              {selectedUserId ? (
                <>
                  {/* Enhanced Chat Header */}
                  <div className="p-5 border-b border-slate-200/60 bg-white/90 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      {isMobileView && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedUserId(null)} 
                          className="p-2 h-9 w-9 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {selectedUserName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg">
                          {selectedUserName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Online
                          </div>
                          <span className="text-slate-400">•</span>
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {messages.length} messages
                          </span>
                        </div>
                      </div>
                      
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    </div>
                  </div>

                  {/* Enhanced Messages Container */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {messages.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <MessageCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <p className="text-lg font-semibold text-slate-700 mb-2">Start the conversation</p>
                        <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                          Send your first message to {selectedUserName} and begin providing excellent customer support.
                        </p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message, index) => {
                          const isAdmin = message.sender === "admin"
                          const showAvatar = index === 0 || messages[index - 1]?.sender !== message.sender
                          
                          return (
                            <div
                              key={message.id}
                              className={`flex items-end gap-3 group ${
                                isAdmin ? "justify-end" : "justify-start"
                              }`}
                              style={{ 
                                animation: `slideInMessage 0.5s ease-out ${index * 0.1}s both`
                              }}
                            >
                              {!isAdmin && showAvatar && (
                                <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md mb-1">
                                  {selectedUserName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              
                              <div
                                className={`
                                  max-w-xs sm:max-w-sm lg:max-w-md px-5 py-3.5 rounded-3xl text-sm shadow-lg
                                  transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]
                                  ${!isAdmin && !showAvatar ? "ml-11" : ""}
                                  ${
                                    isAdmin
                                      ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-emerald-200"
                                      : "bg-white border border-slate-200 text-slate-800 shadow-slate-200"
                                  }
                                `}
                                style={{
                                  borderBottomRightRadius: isAdmin ? "6px" : "24px",
                                  borderBottomLeftRadius: !isAdmin ? "6px" : "24px",
                                }}
                              >
                                <p className="leading-relaxed font-medium">{message.text}</p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                                  <p className={`text-xs font-medium ${
                                    isAdmin ? "text-emerald-100" : "text-slate-400"
                                  }`}>
                                    {formatTime(message.timestamp)}
                                  </p>
                                  {isAdmin && (
                                    <div className="flex items-center gap-1 text-emerald-100">
                                      <Shield className="w-3 h-3" />
                                      <span className="text-xs">Admin</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {isAdmin && showAvatar && (
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg mb-1">
                                  <Shield className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          )
                        })}
                        
                        {typingIndicator && (
                          <div className="flex items-end gap-3 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                              {selectedUserName.charAt(0).toUpperCase()}
                            </div>
                            <div className="bg-white border border-slate-200 px-5 py-3.5 rounded-3xl rounded-bl-md shadow-lg">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Enhanced Scroll Button */}
                  {showScrollButton && (
                    <Button
                      onClick={scrollToBottom}
                      className="absolute bottom-24 right-6 h-12 w-12 rounded-full shadow-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-2 border-white z-10 transform hover:scale-110 transition-all duration-300"
                      size="sm"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </Button>
                  )}

                  {/* Enhanced Message Input */}
                  <div className="p-6 border-t border-slate-200/60 bg-white/90 backdrop-blur-sm">
                    <form onSubmit={sendMessage} className="space-y-4">
                      <div className="flex gap-4 items-end">
                        <div className="flex-1 relative">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                sendMessage(e)
                              }
                            }}
                            placeholder={`Reply to ${selectedUserName}... (Enter to send, Shift+Enter for new line)`}
                            className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm resize-none min-h-[52px] max-h-32 bg-white shadow-sm transition-all duration-300 placeholder:text-slate-400"
                            rows={1}
                          />
                          <div className="absolute bottom-2 right-3 text-xs text-slate-400 font-medium">
                            {newMessage.length > 0 && `${newMessage.length} chars`}
                          </div>
                        </div>
                        <Button
                          type="submit"
                          disabled={!newMessage.trim() || typingIndicator}
                          className="h-[52px] w-[52px] rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3 h-3 text-emerald-600" />
                          <span>Responding as Admin Support</span>
                        </div>
                        <span>
                          {newMessage.length > 0 ? "Type your message..." : "Ready to respond"}
                        </span>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                /* Enhanced Empty State */
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/80">
                  <div className="text-center space-y-6 max-w-md mx-auto p-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                        <MessageCircle className="w-12 h-12 text-emerald-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-slate-800">
                        Welcome to Admin Console
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Select a conversation from the sidebar to begin providing customer support and managing user inquiries.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 pt-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-2">
                          <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">{chatUsers.length}</p>
                        <p className="text-xs text-slate-500">Active Chats</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-2">
                          <MessageCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">{getTotalUnreadCount()}</p>
                        <p className="text-xs text-slate-500">Unread</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInMessage {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-slate-300::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
      `}</style>
    </div>
  )
}

// "use client"

// import { useState, useEffect, useRef } from "react"
// import { db } from "../lib/firebase"
// import {
//   collection,
//   addDoc,
//   query,
//   orderBy,
//   onSnapshot,
//   serverTimestamp,
//   getDocs,
//   doc,
//   updateDoc,
// } from "firebase/firestore"
// import { MessageCircle, Send, Users, Clock, ArrowDown, X } from "lucide-react"
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
// import { Button } from "./ui/button"
// import { Badge } from "./ui/badge"

// export default function AdminChatPanel() {
//   const [chatUsers, setChatUsers] = useState([])
//   const [selectedUserId, setSelectedUserId] = useState(null)
//   const [selectedUserName, setSelectedUserName] = useState("")
//   const [messages, setMessages] = useState([])
//   const [newMessage, setNewMessage] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [showScrollButton, setShowScrollButton] = useState(false)
//   const [isMobileView, setIsMobileView] = useState(false)
//   const messagesEndRef = useRef(null)
//   const messagesContainerRef = useRef(null)

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobileView(window.innerWidth < 1024)
//     }

//     handleResize()
//     window.addEventListener("resize", handleResize)
//     return () => window.removeEventListener("resize", handleResize)
//   }, [])

//   useEffect(() => {
//     console.log("[v0] Setting up real-time listener for chats collection")

//     // Listen to the chats collection in real-time
//     const unsubscribe = onSnapshot(
//       collection(db, "chats"),
//       async (chatsSnapshot) => {
//         console.log("[v0] Chats collection updated, found", chatsSnapshot.size, "chat sessions")

//         const users = []

//         for (const chatDoc of chatsSnapshot.docs) {
//           const userId = chatDoc.id
//           const chatData = chatDoc.data()
//           console.log("[v0] Processing chat for user:", userId, chatData)

//           try {
//             if (chatData.userName && chatData.lastMessage) {
//               // Get unread count by querying messages
//               const messagesSnapshot = await getDocs(
//                 query(collection(db, "chats", userId, "messages"), orderBy("timestamp", "desc")),
//               )

//               const unreadCount = messagesSnapshot.docs.filter(
//                 (doc) => doc.data().sender === "user" && !doc.data().read,
//               ).length

//               console.log("[v0] User data:", {
//                 userId,
//                 userName: chatData.userName,
//                 lastMessage: chatData.lastMessage,
//                 unreadCount,
//               })

//               users.push({
//                 userId,
//                 userName: chatData.userName,
//                 lastMessage: chatData.lastMessage,
//                 lastMessageTime: chatData.lastMessageTime,
//                 unreadCount,
//               })
//             }
//           } catch (error) {
//             console.error("[v0] Error processing messages for user", userId, ":", error)
//           }
//         }

//         // Sort by last message time
//         users.sort((a, b) => {
//           if (!a.lastMessageTime) return 1
//           if (!b.lastMessageTime) return -1
//           return b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis()
//         })

//         console.log("[v0] Final users list:", users)
//         setChatUsers(users)
//         setLoading(false)
//       },
//       (error) => {
//         console.error("[v0] Error listening to chats collection:", error)
//         setLoading(false)
//       },
//     )

//     return () => {
//       console.log("[v0] Cleaning up chats listener")
//       unsubscribe()
//     }
//   }, [])

//   // Listen to messages for selected user
//   useEffect(() => {
//     if (!selectedUserId) return

//     console.log("[v0] Setting up messages listener for user:", selectedUserId)

//     const messagesRef = collection(db, "chats", selectedUserId, "messages")
//     const q = query(messagesRef, orderBy("timestamp", "asc"))

//     const unsubscribe = onSnapshot(
//       q,
//       (snapshot) => {
//         console.log("[v0] Messages updated for user", selectedUserId, "- found", snapshot.size, "messages")

//         const messageList = []
//         snapshot.forEach((doc) => {
//           messageList.push({
//             id: doc.id,
//             ...doc.data(),
//           })
//         })
//         setMessages(messageList)
//       },
//       (error) => {
//         console.error("[v0] Error listening to messages:", error)
//       },
//     )

//     return () => {
//       console.log("[v0] Cleaning up messages listener for user:", selectedUserId)
//       unsubscribe()
//     }
//   }, [selectedUserId])

//   useEffect(() => {
//     const scrollToBottom = () => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//     }

//     const timer = setTimeout(scrollToBottom, 100)
//     return () => clearTimeout(timer)
//   }, [messages])

//   useEffect(() => {
//     const container = messagesContainerRef.current
//     if (!container) return

//     const handleScroll = () => {
//       const { scrollTop, scrollHeight, clientHeight } = container
//       const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
//       setShowScrollButton(!isNearBottom && messages.length > 0)
//     }

//     container.addEventListener("scroll", handleScroll)
//     return () => container.removeEventListener("scroll", handleScroll)
//   }, [messages.length])

//   const selectUser = (userId, userName) => {
//     console.log("[v0] Selecting user:", userId, userName)
//     setSelectedUserId(userId)
//     setSelectedUserName(userName)
//     setMessages([])
//   }

//   const sendMessage = async (e) => {
//     e.preventDefault()
//     if (!newMessage.trim() || !selectedUserId) return

//     console.log("[v0] Sending admin message to user:", selectedUserId)

//     try {
//       const messagesRef = collection(db, "chats", selectedUserId, "messages")
//       await addDoc(messagesRef, {
//         sender: "admin",
//         text: newMessage.trim(),
//         timestamp: serverTimestamp(),
//         userName: "Admin Support",
//       })

//       const chatSessionRef = doc(db, "chats", selectedUserId)
//       await updateDoc(chatSessionRef, {
//         lastMessage: newMessage.trim(),
//         lastMessageTime: serverTimestamp(),
//         lastSender: "admin",
//       })

//       setNewMessage("")
//       console.log("[v0] Admin message sent successfully")
//     } catch (error) {
//       console.error("[v0] Error sending admin message:", error)
//     }
//   }

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   const formatTime = (timestamp) => {
//     if (!timestamp) return ""
//     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//   }

//   const formatDate = (timestamp) => {
//     if (!timestamp) return ""
//     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
//     const now = new Date()
//     const diffTime = Math.abs(now - date)
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

//     if (diffDays === 1) return "Today"
//     if (diffDays === 2) return "Yesterday"
//     if (diffDays <= 7) return `${diffDays - 1} days ago`
//     return date.toLocaleDateString()
//   }

//   if (loading) {
//     return (
//       <Card className="w-full max-w-7xl mx-auto">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <MessageCircle className="w-5 h-5" />
//             Chat Management
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center py-12">
//             <div className="text-center">
//               <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
//               <p className="text-gray-500">Loading chat sessions...</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <Card className="w-full max-w-7xl mx-auto">
//       <CardHeader className="pb-4">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <MessageCircle className="w-6 h-6" />
//           Chat Management
//           <Badge variant="secondary" className="ml-auto">
//             {chatUsers.length} active chats
//           </Badge>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="flex flex-col lg:flex-row h-[600px] lg:h-[700px]">
//           {/* Users List - Mobile: Full width when no user selected, Hidden when user selected */}
//           <div
//             className={`
//             ${isMobileView && selectedUserId ? "hidden" : "flex"} 
//             flex-col w-full lg:w-80 border-r border-gray-200 bg-gray-50/50
//           `}
//           >
//             <div className="p-4 border-b bg-white">
//               <h3 className="font-semibold text-sm flex items-center gap-2">
//                 <Users className="w-4 h-4" />
//                 Chat Users ({chatUsers.length})
//               </h3>
//             </div>
//             <div className="flex-1 overflow-y-auto">
//               {chatUsers.length === 0 ? (
//                 <div className="p-6 text-center text-gray-500">
//                   <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-sm">No chat sessions yet</p>
//                 </div>
//               ) : (
//                 <div className="space-y-1 p-2">
//                   {chatUsers.map((user) => (
//                     <div
//                       key={user.userId}
//                       onClick={() => selectUser(user.userId, user.userName)}
//                       className={`
//                         p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-sm
//                         ${
//                           selectedUserId === user.userId
//                             ? "bg-emerald-50 border border-emerald-200 shadow-sm"
//                             : "hover:bg-gray-50"
//                         }
//                       `}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 mb-1">
//                             <p className="font-medium text-sm truncate">{user.userName}</p>
//                             {user.unreadCount > 0 && (
//                               <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
//                                 {user.unreadCount}
//                               </Badge>
//                             )}
//                           </div>
//                           <p className="text-xs text-gray-600 truncate mb-1">{user.lastMessage}</p>
//                           <p className="text-xs text-gray-400">{formatDate(user.lastMessageTime)}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Chat Messages - Mobile: Full width when user selected */}
//           <div
//             className={`
//             ${isMobileView && !selectedUserId ? "hidden" : "flex"} 
//             flex-col flex-1 bg-white relative
//           `}
//           >
//             {selectedUserId ? (
//               <>
//                 <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-emerald-100/50 flex items-center gap-3">
//                   {isMobileView && (
//                     <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(null)} className="p-1 h-8 w-8">
//                       <X className="w-4 h-4" />
//                     </Button>
//                   )}
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-sm text-emerald-800">Chat with {selectedUserName}</h3>
//                     <p className="text-xs text-emerald-600 mt-0.5">{messages.length} messages</p>
//                   </div>
//                 </div>

//                 <div
//                   ref={messagesContainerRef}
//                   className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
//                   style={{ scrollBehavior: "smooth" }}
//                 >
//                   {messages.length === 0 ? (
//                     <div className="text-center text-gray-500 py-12">
//                       <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                       <p className="text-sm">No messages yet</p>
//                       <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
//                     </div>
//                   ) : (
//                     messages.map((message, index) => (
//                       <div
//                         key={message.id}
//                         className={`flex animate-in slide-in-from-bottom-2 duration-300 ${
//                           message.sender === "admin" ? "justify-end" : "justify-start"
//                         }`}
//                         style={{ animationDelay: `${index * 50}ms` }}
//                       >
//                         <div
//                           className={`
//                             max-w-xs sm:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm
//                             transition-all duration-200 hover:shadow-md
//                             ${
//                               message.sender === "admin"
//                                 ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md"
//                                 : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
//                             }
//                           `}
//                         >
//                           <p className="leading-relaxed">{message.text}</p>
//                           <p
//                             className={`text-xs mt-2 ${
//                               message.sender === "admin" ? "text-emerald-100" : "text-gray-500"
//                             }`}
//                           >
//                             {formatTime(message.timestamp)}
//                           </p>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                   <div ref={messagesEndRef} />
//                 </div>

//                 {showScrollButton && (
//                   <Button
//                     onClick={scrollToBottom}
//                     className="absolute bottom-20 right-4 h-10 w-10 rounded-full shadow-lg bg-emerald-500 hover:bg-emerald-600 z-10"
//                     size="sm"
//                   >
//                     <ArrowDown className="w-4 h-4" />
//                   </Button>
//                 )}

//                 <form onSubmit={sendMessage} className="p-4 border-t bg-gray-50/50">
//                   <div className="flex gap-3 items-end">
//                     <div className="flex-1">
//                       <textarea
//                         value={newMessage}
//                         onChange={(e) => setNewMessage(e.target.value)}
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter" && !e.shiftKey) {
//                             e.preventDefault()
//                             sendMessage(e)
//                           }
//                         }}
//                         placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none min-h-[44px] max-h-32"
//                         rows={1}
//                       />
//                     </div>
//                     <Button
//                       type="submit"
//                       disabled={!newMessage.trim()}
//                       className="h-11 w-11 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//                     >
//                       <Send className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </form>
//               </>
//             ) : (
//               <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50/30">
//                 <div className="text-center">
//                   <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                   <p className="text-lg font-medium mb-2">Select a user to start chatting</p>
//                   <p className="text-sm text-gray-400">Choose from {chatUsers.length} active conversations</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
