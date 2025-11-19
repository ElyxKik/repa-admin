import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  // Check if Firebase app already exists
  if (getApps().length > 0) {
    app = getApp();
  } else {
    // Validate config before initialization
    if (!firebaseConfig.apiKey) {
      if (typeof window === 'undefined') {
        console.warn('⚠️ Firebase API key missing during server-side render/build. Skipping initialization.');
        throw new Error('Missing Firebase API Key during build');
      } else {
        console.error('❌ Firebase API key is missing! Check your .env.local file.');
      }
    }
    app = initializeApp(firebaseConfig);
  }

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

} catch (error) {
  console.error('Error initializing Firebase:', error);
  
  // Create mock objects to prevent build crashes
  // This allows the build to pass even if Firebase keys are missing/invalid
  // The app will verify keys again on the client side
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { auth, db, storage }
export default app
