import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, getDocs, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// const firebaseConfig = {
//   apiKey: "AIzaSyCRLJ6F4NkqiKFcaYElTOh0YeXiq-8zH7w",
//   authDomain: "landing-page14.firebaseapp.com",
//   projectId: "landing-page14",
//   storageBucket: "landing-page14.firebasestorage.app",
//   messagingSenderId: "518384917017",
//   appId: "1:518384917017:web:e612cc4d73db0e1eaa6888",
// }

const firebaseConfig = {
  apiKey: "AIzaSyAbdRnn57wLduX8EnnU_QHCBsJlqQau59I",
  authDomain: "mediglobal-75622.firebaseapp.com",
  projectId: "mediglobal-75622",
  storageBucket: "mediglobal-75622.firebasestorage.app",
  messagingSenderId: "1070065265121",
  appId: "1:1070065265121:web:aeb03c9e5c9c4199898aa0"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Admin functions for managing users
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"))
    const users = []
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() })
    })
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export const updateUserStatus = async (userId, status) => {
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

export const getAllOrders = async () => {
    try {
      const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(ordersQuery)
      const ordersData = []
      querySnapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() })
      })
      return ordersData
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }

  export const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      })
      toast.success(`Order status updated to ${newStatus}`)
      refreshData()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    }
  }


// Admin functions for managing consultant applications
export const getAllConsultantApplications = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "consultationApplications"))
    const applications = []
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() })
    })
    return applications
  } catch (error) {
    console.error("Error fetching consultant applications:", error)
    throw error
  }
}

export const updateConsultantApplicationStatus = async (applicationId, status) => {
  try {
    const applicationRef = doc(db, "consultationApplications", applicationId)
    await updateDoc(applicationRef, {
      status: status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating consultant application status:", error)
    throw error
  }
}

// Admin functions for managing consultation bookings
export const getAllConsultationBookings = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "consultations"))
    const bookings = []
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() })
    })
    return bookings
  } catch (error) {
    console.error("Error fetching consultation bookings:", error)
    throw error
  }
}

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const bookingRef = doc(db, "consultations", bookingId)
    await updateDoc(bookingRef, {
      status: status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    throw error
  }
}

// Admin functions for managing supplier devices
export const getAllSupplierDevices = async () => {
  try {
    const [basicSnapshot, premiumSnapshot] = await Promise.all([
      getDocs(collection(db, "suppliers_basic")),
      getDocs(collection(db, "suppliers_premium")),
    ])

    const devices = []

    basicSnapshot.forEach((docSnap) => {
      devices.push({ id: docSnap.id, type: "suppliers_basic", ...docSnap.data() })
    })

    premiumSnapshot.forEach((docSnap) => {
      devices.push({ id: docSnap.id, type: "suppliers_premium", ...docSnap.data() })
    })

    return devices
  } catch (error) {
    console.error("Error fetching supplier devices:", error)
    throw error
  }
}

export const updateDeviceStatus = async (device, status) => {
  try {
    if (!device?.id || !device?.type) {
      throw new Error("Device object must include id and type (suppliers_basic or suppliers_premium)")
    }

    let collectionName = device.type

    // Fix collection name if it's been shortened
    if (device.type === "basic") {
      collectionName = "suppliers_basic"
    } else if (device.type === "premium") {
      collectionName = "suppliers_premium"
    }

    const deviceRef = doc(db, collectionName, device.id)
    await updateDoc(deviceRef, {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating device status:", error)
    throw error
  }
}

// Admin functions for managing feedback
export const getAllFeedback = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "feedbacks"))
    const feedback = []
    querySnapshot.forEach((doc) => {
      feedback.push({ id: doc.id, ...doc.data() })
    })
    return feedback
  } catch (error) {
    console.error("Error fetching feedback:", error)
    throw error
  }
}

export const updateFeedbackStatus = async (feedbackId, status) => {
  try {
    const feedbackRef = doc(db, "feedbacks", feedbackId)
    await updateDoc(feedbackRef, {
      status: status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating feedback status:", error)
    throw error
  }
}
