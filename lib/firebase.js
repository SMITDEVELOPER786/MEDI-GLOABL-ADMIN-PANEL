import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
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

export const getHomeContent = async () => {
  try {
    const docRef = doc(db, "siteContent", "home");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        howWeHelp:
          "At MediGlobal, we believe that advancing healthcare begins with smarter access, trusted tools, and human-centered technology. That's why we're more than just a marketplace — our platform brings together verified medical devices, biomedical expertise, and interactive learning to create a safer, more connected healthcare environment.",
        ourStory:
          "At MediGlobal, we saw a critical gap in how medical technology reaches the people who need it most. Across hospitals, labs, and clinics, the process of sourcing medical devices remains slow, fragmented, and often lacking the transparency required for safe and confident decision-making. We founded MediGlobal to change that. Bringing together deep experience in biomedical engineering, clinical workflows, and digital health, our platform was built to streamline medical device access across the MENA region and beyond. From procurement and product education to expert guidance and supplier trust, MediGlobal is designed to support every stage of the healthcare technology journey. We believe that better access to reliable medical equipment means better care, better outcomes, and better trust in the systems we rely on every day. MediGlobal continues to grow — one device, one connection, one safer decision at a time.",
      };
    }

    return docSnap.data();
  } catch (error) {
    console.error("Error fetching home content:", error);
    throw error;
  }
};

export const updateHomeContent = async (content) => {
  try {
    const docRef = doc(db, "siteContent", "home");
    await setDoc(
      docRef,
      {
        ...content,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating home content:", error);
    throw error;
  }
};


// Admin Device of the Week functions
export const getDeviceOfTheWeek = async () => {
  try {
    const snapshot = await getDocs(collection(db, "deviceOfTheWeek"));
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching device of the week:", error);
    throw error;
  }
};

export const setDeviceOfTheWeek = async (deviceData) => {
  try {
    // Clear existing devices of the week
    const snapshot = await getDocs(collection(db, "deviceOfTheWeek"));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Add new device of the week
    const docRef = await addDoc(collection(db, "deviceOfTheWeek"), {
      ...deviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error setting device of the week:", error);
    throw error;
  }
};

export const updateDeviceOfTheWeek = async (deviceId, deviceData) => {
  try {
    const deviceRef = doc(db, "deviceOfTheWeek", deviceId);
    await updateDoc(deviceRef, {
      ...deviceData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating device of the week:", error);
    throw error;
  }
};


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
