'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: 'CLIENT' | 'TECHNICIAN' | 'ADMIN'
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<UserData | null> => {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          role: data.role,
          isVerified: data.isVerified
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      // Set persistence to LOCAL
      await setPersistence(auth, browserLocalPersistence)
      
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      // Fetch user data from Firestore
      const data = await fetchUserData(firebaseUser.uid)
      
      if (!data) {
        await firebaseSignOut(auth)
        throw new Error('Utilisateur non trouvé dans la base de données')
      }
      
      // Check if user is admin
      if (data.role !== 'ADMIN') {
        await firebaseSignOut(auth)
        throw new Error('Accès refusé. Seuls les administrateurs peuvent se connecter.')
      }
      
      setUserData(data)
      toast.success('Connexion réussie!')
      router.push('/')
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      // Handle specific Firebase errors
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        throw new Error('Email ou mot de passe incorrect')
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Utilisateur non trouvé')
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives. Réessayez plus tard.')
      } else if (error.message) {
        throw error
      } else {
        throw new Error('Erreur de connexion')
      }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserData(null)
      toast.success('Déconnexion réussie')
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Erreur lors de la déconnexion')
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Fetch user data from Firestore
        const data = await fetchUserData(firebaseUser.uid)
        
        if (data && data.role === 'ADMIN') {
          setUserData(data)
        } else {
          // If not admin, sign out
          await firebaseSignOut(auth)
          setUser(null)
          setUserData(null)
          toast.error('Accès refusé. Seuls les administrateurs peuvent accéder.')
          router.push('/login')
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const isAdmin = userData?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, userData, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
