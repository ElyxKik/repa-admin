# 🔥 Configuration Firebase Authentication - Guide Complet

## ✅ Ce qui a été implémenté

### 1. Système d'authentification complet
- ✅ Connexion par email/mot de passe via Firebase Auth
- ✅ Vérification automatique du rôle ADMIN depuis Firestore
- ✅ Protection de toutes les routes du dashboard
- ✅ Déconnexion sécurisée
- ✅ Session persistante

### 2. Restriction d'accès stricte
- ⚠️ **Seuls les utilisateurs avec `role: "ADMIN"` peuvent se connecter**
- ⚠️ Vérification en temps réel du rôle
- ⚠️ Déconnexion automatique si le rôle change

### 3. Composants créés

```
src/
├── contexts/
│   └── AuthContext.tsx                    # Gestion de l'authentification
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx            # Protection des routes
│   └── layout/
│       └── ProtectedDashboardLayout.tsx  # Layout protégé
```

## 🚀 Configuration requise

### Étape 1: Activer Firebase Authentication

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionner votre projet **repa-ef227**
3. Menu **Authentication** > **Sign-in method**
4. Activer **Email/Password**
5. Cliquer sur **Save**

### Étape 2: Créer votre premier administrateur

#### Option A: Via Firebase Console (Recommandé pour le premier admin)

**Partie 1 - Firebase Auth:**
1. Firebase Console > **Authentication** > **Users**
2. Cliquer **Add user**
3. Entrer:
   - Email: `admin@repa.com` (ou votre email)
   - Password: Votre mot de passe sécurisé
4. Cliquer **Add user**
5. **IMPORTANT**: Noter l'**UID** affiché (ex: `abc123def456`)

**Partie 2 - Firestore:**
1. Firebase Console > **Firestore Database**
2. Cliquer sur la collection **users** (ou créer si n'existe pas)
3. Cliquer **Add document**
4. **Document ID**: Coller l'**UID** de l'étape précédente
5. Ajouter les champs suivants:

| Champ | Type | Valeur |
|-------|------|--------|
| uid | string | L'UID de Firebase Auth |
| email | string | admin@repa.com |
| displayName | string | Admin REPA |
| photoURL | string | null |
| phoneNumber | string | null |
| **role** | **string** | **ADMIN** ⚠️ |
| isVerified | boolean | true |
| isVIP | boolean | false |
| ville | string | null |
| location | map | null |
| rating | number | 0 |
| reviewCount | number | 0 |
| hourlyRate | number | 0 |
| specialties | array | [] |
| createdAt | string | 2024-11-18T10:00:00Z |
| updatedAt | string | 2024-11-18T10:00:00Z |

6. Cliquer **Save**

⚠️ **CRITIQUE**: Le champ `role` doit être exactement `"ADMIN"` en majuscules !

#### Option B: Via script Node.js

```bash
# Depuis le dossier repa-admin
node scripts/create-admin.js
```

Suivre les instructions à l'écran.

### Étape 3: Vérifier la configuration

1. Vérifier que `.env.local` contient:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=repa-ef227.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=repa-ef227
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=repa-ef227.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=768385093157
NEXT_PUBLIC_FIREBASE_APP_ID=1:768385093157:web:xxx
```

2. Lancer l'application:
```bash
npm run dev
```

3. Ouvrir http://localhost:3000
4. Vous serez redirigé vers `/login`
5. Entrer vos identifiants admin
6. Vous devriez être redirigé vers le dashboard

## ✅ Test de connexion

### Scénario de succès

1. **Connexion**
   - Entrer email et mot de passe
   - Cliquer "Se Connecter"
   - ✅ Message: "Connexion réussie!"
   - ✅ Redirection vers le dashboard

2. **Dashboard**
   - ✅ Votre nom/email s'affiche en haut à droite
   - ✅ Vous pouvez naviguer dans toutes les pages
   - ✅ Toutes les fonctionnalités sont accessibles

3. **Déconnexion**
   - Cliquer sur "Déconnexion" dans la sidebar
   - ✅ Message: "Déconnexion réussie"
   - ✅ Redirection vers `/login`

### Scénarios d'erreur

#### ❌ "Accès refusé. Seuls les administrateurs..."

**Cause**: L'utilisateur n'a pas le rôle ADMIN

**Solution**:
1. Vérifier dans Firestore que le document `users/{uid}` existe
2. Vérifier que `role === "ADMIN"` (sensible à la casse)
3. Vérifier que l'UID du document = UID Firebase Auth

#### ❌ "Email ou mot de passe incorrect"

**Cause**: Credentials invalides

**Solution**:
1. Vérifier l'email et le mot de passe
2. Vérifier que l'utilisateur existe dans Firebase Auth
3. Réinitialiser le mot de passe si nécessaire

#### ❌ "Utilisateur non trouvé dans la base de données"

**Cause**: Le document Firestore n'existe pas

**Solution**:
1. Créer le document dans `users/{uid}`
2. S'assurer que l'ID du document = UID Firebase Auth

## 🔒 Règles de sécurité Firestore

Configurer les règles dans Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && 
                    (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin();
    }
    
    // KYC - Admin only
    match /kyc_verifications/{kycId} {
      allow read, write: if isAdmin();
    }
    
    match /kyc_documents/{docId} {
      allow read, write: if isAdmin();
    }
    
    // Autres collections...
  }
}
```

## 📱 Utilisation dans le code

### Protéger une page

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

### Accéder aux données utilisateur

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, userData, isAdmin, signOut } = useAuth()
  
  return (
    <div>
      <p>Email: {userData?.email}</p>
      <p>Nom: {userData?.displayName}</p>
      <button onClick={signOut}>Déconnexion</button>
    </div>
  )
}
```

## 🔧 Dépannage

### Problème: Redirection infinie

**Solutions**:
1. Vider le cache du navigateur
2. Vérifier que `/login` n'utilise pas `ProtectedRoute`
3. Vérifier les variables d'environnement
4. Redémarrer le serveur (`npm run dev`)

### Problème: "Cannot read properties of undefined"

**Solutions**:
1. Vérifier que `AuthProvider` est bien dans `layout.tsx`
2. Vérifier que vous utilisez `useAuth()` dans un composant enfant
3. Vérifier la console pour les erreurs Firebase

### Problème: L'utilisateur est déconnecté immédiatement

**Causes possibles**:
1. Le rôle n'est pas "ADMIN" dans Firestore
2. Le document Firestore n'existe pas
3. L'UID ne correspond pas

**Solution**:
1. Vérifier dans Firestore Console
2. Recréer le document si nécessaire

## 📚 Documentation complète

- `AUTHENTICATION.md` - Guide détaillé d'authentification
- `QUICK_START_AUTH.md` - Démarrage rapide
- `CHANGELOG_AUTH.md` - Historique des changements
- `/Users/elykik/Documents/Dev/repa/FIRESTORE_SCHEMA.md` - Schéma Firestore

## 🎯 Checklist de configuration

- [ ] Firebase Authentication activé (Email/Password)
- [ ] Premier utilisateur admin créé dans Firebase Auth
- [ ] Document Firestore créé dans `users/{uid}` avec `role: "ADMIN"`
- [ ] Variables d'environnement configurées dans `.env.local`
- [ ] Application lancée avec `npm run dev`
- [ ] Test de connexion réussi
- [ ] Test de déconnexion réussi
- [ ] Règles de sécurité Firestore configurées

## ✨ Résumé

Vous avez maintenant un système d'authentification Firebase complet avec:

✅ Connexion sécurisée par email/mot de passe  
✅ Restriction stricte au rôle ADMIN  
✅ Protection automatique de toutes les routes  
✅ Gestion de session persistante  
✅ Déconnexion sécurisée  
✅ Vérification en temps réel du rôle  

**Prochaine étape**: Créer votre premier admin et tester la connexion !

---

**Besoin d'aide ?** Consultez `QUICK_START_AUTH.md` pour un guide pas à pas.
