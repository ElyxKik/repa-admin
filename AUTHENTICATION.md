# 🔐 Authentification Firebase - REPA Admin Dashboard

## Vue d'ensemble

Le dashboard REPA Admin utilise Firebase Authentication avec une restriction stricte au rôle **ADMIN**. Seuls les utilisateurs ayant le rôle `ADMIN` dans la collection Firestore `users` peuvent se connecter.

## Architecture

### 1. Contexte d'authentification (`AuthContext.tsx`)

Le contexte d'authentification gère :
- **Connexion** : Authentification Firebase + vérification du rôle admin
- **Déconnexion** : Nettoyage de la session
- **État utilisateur** : Synchronisation avec Firebase Auth et Firestore
- **Vérification du rôle** : Validation automatique du rôle ADMIN

```typescript
const { user, userData, loading, signIn, signOut, isAdmin } = useAuth()
```

### 2. Protection des routes (`ProtectedRoute.tsx`)

Composant qui protège les pages en :
- Vérifiant l'authentification
- Validant le rôle ADMIN
- Redirigeant vers `/login` si non autorisé
- Affichant un loader pendant la vérification

### 3. Layout protégé (`ProtectedDashboardLayout.tsx`)

Wrapper combinant protection + layout pour simplifier l'utilisation :

```tsx
<ProtectedDashboardLayout>
  {/* Votre contenu de page */}
</ProtectedDashboardLayout>
```

## Flux d'authentification

### Connexion

1. L'utilisateur entre email/mot de passe sur `/login`
2. Firebase Auth vérifie les credentials
3. Le système récupère les données utilisateur depuis Firestore (`users/{uid}`)
4. Vérification du champ `role === 'ADMIN'`
5. Si admin : connexion réussie → redirection vers `/`
6. Si non-admin : déconnexion automatique + message d'erreur

### Vérification continue

Le `AuthContext` écoute les changements d'état Firebase :
- À chaque changement, vérifie le rôle dans Firestore
- Si le rôle n'est plus ADMIN, déconnexion automatique
- Redirection vers `/login` si non authentifié

### Déconnexion

1. Appel de `signOut()`
2. Déconnexion Firebase
3. Nettoyage de l'état local
4. Redirection vers `/login`

## Structure Firestore requise

### Collection `users/{uid}`

```json
{
  "uid": "firebase_uid",
  "email": "admin@repa.com",
  "displayName": "Admin REPA",
  "photoURL": "https://...",
  "role": "ADMIN",  // ⚠️ OBLIGATOIRE : doit être "ADMIN"
  "isVerified": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Configuration Firebase

### Variables d'environnement (`.env.local`)

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Allow read if authenticated and is the user or is admin
      allow read: if request.auth != null && 
                    (request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
      
      // Only admins can write
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
  }
}
```

## Utilisation dans les pages

### Page protégée simple

```tsx
'use client'

import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout'

export default function MyPage() {
  return (
    <ProtectedDashboardLayout>
      <h1>Ma page protégée</h1>
      {/* Votre contenu */}
    </ProtectedDashboardLayout>
  )
}
```

### Accès aux données utilisateur

```tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const { user, userData, isAdmin } = useAuth()

  return (
    <div>
      <p>Email: {userData?.email}</p>
      <p>Nom: {userData?.displayName}</p>
      <p>Est admin: {isAdmin ? 'Oui' : 'Non'}</p>
    </div>
  )
}
```

## Création d'un utilisateur admin

### Via Firebase Console

1. Créer un utilisateur dans Firebase Authentication
2. Noter l'UID de l'utilisateur
3. Créer un document dans Firestore :
   - Collection: `users`
   - Document ID: `{uid}` (l'UID Firebase)
   - Données: voir structure ci-dessus avec `role: "ADMIN"`

### Via script (exemple)

```javascript
const admin = require('firebase-admin');

async function createAdmin(email, password, displayName) {
  // Créer l'utilisateur dans Firebase Auth
  const userRecord = await admin.auth().createUser({
    email: email,
    password: password,
    displayName: displayName
  });

  // Créer le document Firestore
  await admin.firestore().collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email: email,
    displayName: displayName,
    photoURL: null,
    role: 'ADMIN',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log('Admin créé avec succès:', userRecord.uid);
}
```

## Sécurité

### Bonnes pratiques

✅ **Vérification côté serveur** : Toujours vérifier le rôle dans les API routes
✅ **Règles Firestore** : Utiliser les règles de sécurité Firestore
✅ **HTTPS uniquement** : Toujours utiliser HTTPS en production
✅ **Tokens sécurisés** : Firebase gère automatiquement les tokens JWT

### Points d'attention

⚠️ Le rôle est vérifié à chaque changement d'état d'authentification
⚠️ Si le rôle change dans Firestore, l'utilisateur sera déconnecté automatiquement
⚠️ Ne jamais exposer les credentials Firebase dans le code client

## Dépannage

### L'utilisateur ne peut pas se connecter

1. Vérifier que l'utilisateur existe dans Firebase Auth
2. Vérifier que le document existe dans `users/{uid}`
3. Vérifier que `role === 'ADMIN'` (sensible à la casse)
4. Vérifier les règles de sécurité Firestore

### Erreur "Accès refusé"

- L'utilisateur n'a pas le rôle ADMIN dans Firestore
- Mettre à jour le champ `role` à `"ADMIN"` dans le document utilisateur

### Redirection infinie

- Vérifier que la page `/login` n'utilise pas `ProtectedRoute`
- Vérifier les conditions de redirection dans `AuthContext`

## Support

Pour toute question ou problème, consulter :
- [Documentation Firebase Auth](https://firebase.google.com/docs/auth)
- [Documentation Firestore](https://firebase.google.com/docs/firestore)
- [Schéma Firestore REPA](/Users/elykik/Documents/Dev/repa/FIRESTORE_SCHEMA.md)
