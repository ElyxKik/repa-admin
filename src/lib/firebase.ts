import { initializeApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Debug: Vérifier que les clés sont chargées (à retirer en production)
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase Config Check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyStart: firebaseConfig.apiKey?.substring(0, 10) + '...',
    projectId: firebaseConfig.projectId,
    hasAppId: !!firebaseConfig.appId,
  })
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app)

// Initialize Cloud Firestore
export const db: Firestore = getFirestore(app)

// Initialize Cloud Storage
export const storage: FirebaseStorage = getStorage(app)

export default app
