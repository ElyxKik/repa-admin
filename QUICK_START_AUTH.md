# 🚀 Démarrage Rapide - Authentification Admin

## Prérequis

- ✅ Projet Firebase configuré
- ✅ Variables d'environnement dans `.env.local`
- ✅ Firebase Authentication activé (Email/Password)
- ✅ Firestore Database créé

## Étapes de configuration

### 1. Vérifier la configuration Firebase

Assurez-vous que `.env.local` contient :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Activer Email/Password dans Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionner votre projet
3. Aller dans **Authentication** > **Sign-in method**
4. Activer **Email/Password**

### 3. Créer votre premier administrateur

#### Option A: Via Firebase Console (Recommandé)

**Étape 1 - Créer l'utilisateur dans Firebase Auth:**
1. Firebase Console > **Authentication** > **Users**
2. Cliquer sur **Add user**
3. Entrer email et mot de passe
4. Noter l'**UID** de l'utilisateur créé

**Étape 2 - Créer le document Firestore:**
1. Firebase Console > **Firestore Database**
2. Créer une collection `users` (si elle n'existe pas)
3. Ajouter un document avec l'**UID** comme ID
4. Ajouter les champs suivants :

```json
{
  "uid": "l'UID_de_firebase_auth",
  "email": "admin@repa.com",
  "displayName": "Admin REPA",
  "photoURL": null,
  "phoneNumber": null,
  "role": "ADMIN",
  "isVerified": true,
  "isVIP": false,
  "ville": null,
  "location": null,
  "rating": 0,
  "reviewCount": 0,
  "hourlyRate": 0,
  "specialties": [],
  "createdAt": "2024-11-18T10:00:00Z",
  "updatedAt": "2024-11-18T10:00:00Z"
}
```

⚠️ **IMPORTANT**: Le champ `role` doit être exactement `"ADMIN"` (en majuscules)

#### Option B: Via script Node.js

```bash
# Installer firebase-admin si pas déjà fait
npm install firebase-admin

# Exécuter le script
node scripts/create-admin.js
```

Suivre les instructions à l'écran.

### 4. Lancer l'application

```bash
npm run dev
```

### 5. Se connecter

1. Ouvrir http://localhost:3000
2. Vous serez redirigé vers `/login`
3. Entrer vos identifiants admin
4. Vous serez redirigé vers le dashboard

## ✅ Vérification

### Test de connexion réussie

Si tout fonctionne :
- ✅ Vous êtes redirigé vers le dashboard après connexion
- ✅ Votre nom/email s'affiche en haut à droite
- ✅ Vous pouvez naviguer dans toutes les pages
- ✅ Le bouton de déconnexion fonctionne

### Problèmes courants

#### ❌ "Accès refusé. Seuls les administrateurs..."

**Cause**: L'utilisateur n'a pas le rôle ADMIN dans Firestore

**Solution**:
1. Vérifier que le document existe dans `users/{uid}`
2. Vérifier que `role === "ADMIN"` (sensible à la casse)
3. Vérifier que l'UID du document correspond à l'UID Firebase Auth

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

#### ❌ Redirection infinie

**Cause**: Problème de configuration

**Solution**:
1. Vider le cache du navigateur
2. Vérifier les variables d'environnement
3. Redémarrer le serveur de développement

## 🔒 Règles de sécurité Firestore

Ajouter ces règles dans Firebase Console > Firestore > Rules :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
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
    
    // KYC verifications - Admin only
    match /kyc_verifications/{kycId} {
      allow read, write: if isAdmin();
    }
    
    // KYC documents - Admin only
    match /kyc_documents/{docId} {
      allow read, write: if isAdmin();
    }
    
    // Notifications
    match /notifications/{notifId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }
    
    // Repair requests
    match /repair_requests/{requestId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Payments
    match /payments/{paymentId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }
    
    // Specialties
    match /specialties/{specialtyId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

## 📱 Test complet

### Scénario de test

1. **Connexion avec admin**
   - ✅ Connexion réussie
   - ✅ Redirection vers dashboard
   - ✅ Affichage du nom

2. **Navigation**
   - ✅ Accès à toutes les pages
   - ✅ Pas de redirection intempestive

3. **Déconnexion**
   - ✅ Clic sur "Déconnexion"
   - ✅ Redirection vers `/login`
   - ✅ Impossible d'accéder aux pages protégées

4. **Tentative de connexion non-admin**
   - ✅ Message d'erreur approprié
   - ✅ Pas d'accès au dashboard

## 🎯 Prochaines étapes

Après avoir configuré l'authentification :

1. ✅ Tester la connexion/déconnexion
2. ✅ Créer d'autres utilisateurs admin si nécessaire
3. ✅ Configurer les règles de sécurité Firestore
4. ✅ Tester les fonctionnalités du dashboard
5. ✅ Déployer en production

## 📚 Documentation complète

- `AUTHENTICATION.md` - Guide complet d'authentification
- `CHANGELOG_AUTH.md` - Détails des changements
- `/Users/elykik/Documents/Dev/repa/FIRESTORE_SCHEMA.md` - Schéma Firestore

## 🆘 Besoin d'aide ?

1. Consulter `AUTHENTICATION.md` pour plus de détails
2. Vérifier la console Firebase pour les erreurs
3. Vérifier la console du navigateur (F12)
4. Vérifier les logs du serveur Next.js

---

**Bon développement ! 🚀**
