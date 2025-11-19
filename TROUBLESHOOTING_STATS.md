# 🔍 Diagnostic - Statistiques à 0

## Problème

Les statistiques du dashboard affichent toutes "0" :
```
Utilisateurs Totaux: 0
Techniciens Vérifiés: 0
Demandes Ouvertes: 0
KYC En Attente: 0
```

## Causes possibles

### 1. Collections Firestore vides ⚠️ (Cause la plus probable)

**Symptôme**: Les collections n'existent pas ou ne contiennent aucun document.

**Vérification**:
1. Ouvrir [Firestore Console](https://console.firebase.google.com/project/repa-ef227/firestore)
2. Vérifier si ces collections existent:
   - `users`
   - `repair_requests`
   - `kyc_verifications`

**Solution**: Ajouter des données de test

#### Option A: Via script (Recommandé)
```bash
node scripts/seed-firestore.js
```

Ce script créera automatiquement:
- 3 utilisateurs (1 client, 2 techniciens)
- 3 demandes de réparation
- 2 vérifications KYC
- 2 documents KYC

#### Option B: Manuellement via Firestore Console

**Créer un utilisateur**:
1. Collection: `users`
2. Document ID: `user_001`
3. Données:
```json
{
  "uid": "user_001",
  "email": "test@repa.com",
  "displayName": "Test User",
  "role": "CLIENT",
  "isVerified": true,
  "createdAt": "2024-11-18T07:00:00Z",
  "updatedAt": "2024-11-18T07:00:00Z"
}
```

**Créer une demande de réparation**:
1. Collection: `repair_requests`
2. Auto-ID
3. Données:
```json
{
  "title": "Test réparation",
  "category": "PHONE",
  "status": "OPEN",
  "estimatedPrice": 100,
  "createdAt": [Timestamp now]
}
```

### 2. Règles de sécurité Firestore trop restrictives

**Symptôme**: Erreur dans la console: `permission-denied`

**Vérification**:
1. Ouvrir la console du navigateur (F12)
2. Chercher: `🚫 Accès refusé: Vérifiez les règles de sécurité Firestore`

**Solution**: Mettre à jour les règles Firestore

1. Aller sur [Firestore Rules](https://console.firebase.google.com/project/repa-ef227/firestore/rules)
2. Remplacer par:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Users - Lecture pour tous les authentifiés, écriture pour admin
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Repair requests - Lecture pour tous les authentifiés
    match /repair_requests/{requestId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // KYC verifications - Admin seulement
    match /kyc_verifications/{kycId} {
      allow read, write: if isAdmin();
    }
    
    // KYC documents - Admin seulement
    match /kyc_documents/{docId} {
      allow read, write: if isAdmin();
    }
  }
}
```

3. Cliquer **Publish**

### 3. Problème de connexion Firebase

**Symptôme**: Erreur dans la console: `unavailable` ou `network error`

**Vérification**:
1. Console du navigateur (F12)
2. Chercher: `🌐 Firestore indisponible`

**Solution**:
- Vérifier votre connexion internet
- Vérifier que Firebase n'est pas en maintenance
- Redémarrer le serveur: `npm run dev`

### 4. Clés Firebase incorrectes

**Symptôme**: Erreur: `API key not valid`

**Vérification**:
Console du navigateur devrait afficher:
```
🔥 Firebase Config Check: {
  hasApiKey: true,
  apiKeyStart: 'AIzaSyCw8q...',
  projectId: 'repa-ef227',
  hasAppId: true
}
```

**Solution**: Voir `FIREBASE_AUTH_SETUP.md`

## 🔍 Diagnostic étape par étape

### Étape 1: Vérifier la console du navigateur

1. Ouvrir le dashboard: http://localhost:3000
2. Ouvrir la console (F12)
3. Chercher les messages:

```
📊 Chargement des statistiques...
🔍 Comptage des utilisateurs...
✅ Utilisateurs totaux: X
🔍 Comptage des techniciens vérifiés...
✅ Techniciens vérifiés: X
...
```

### Étape 2: Identifier l'erreur

**Si vous voyez**:
- `✅ Utilisateurs totaux: 0` → Collections vides (normal si première utilisation)
- `❌ Erreur lors du chargement` → Problème de permissions ou connexion
- `🚫 Accès refusé` → Règles Firestore trop restrictives
- `🌐 Firestore indisponible` → Problème de connexion

### Étape 3: Appliquer la solution

Selon l'erreur identifiée, suivre la solution correspondante ci-dessus.

## ✅ Vérification après correction

### 1. Vérifier Firestore Console

Aller sur https://console.firebase.google.com/project/repa-ef227/firestore

Vous devriez voir:
- ✅ Collection `users` avec au moins 1 document
- ✅ Collection `repair_requests` (optionnel)
- ✅ Collection `kyc_verifications` (optionnel)

### 2. Rafraîchir le dashboard

1. Rafraîchir la page (F5)
2. Les statistiques devraient se mettre à jour
3. Console devrait afficher:
```
✅ Utilisateurs totaux: 3
✅ Techniciens vérifiés: 1
✅ Demandes ouvertes: 3
✅ KYC en attente: 1
```

## 🚀 Commandes rapides

### Ajouter des données de test
```bash
node scripts/seed-firestore.js
```

### Vérifier la compilation
```bash
npm run type-check
```

### Redémarrer le serveur
```bash
# Ctrl+C pour arrêter
npm run dev
```

### Vider le cache du navigateur
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

## 📊 Données de test créées par le script

Le script `seed-firestore.js` crée:

**Utilisateurs** (3):
- 1 client: `client1@repa.com`
- 2 techniciens: `tech1@repa.com`, `tech2@repa.com`

**Demandes de réparation** (3):
- 1 OPEN (ouverte)
- 1 ASSIGNED (assignée)
- 1 IN_PROGRESS (en cours)

**Vérifications KYC** (2):
- 1 VERIFIED (vérifiée)
- 1 IN_PROGRESS (en attente)

**Résultat attendu**:
```
Utilisateurs Totaux: 3
Techniciens Vérifiés: 1
Demandes Ouvertes: 3
KYC En Attente: 1
```

## 🆘 Toujours bloqué ?

### Vérifier les logs détaillés

La console devrait afficher des logs détaillés:
```javascript
📊 Chargement des statistiques...
🔍 Comptage des utilisateurs...
✅ Utilisateurs totaux: 3
🔍 Comptage des techniciens vérifiés...
✅ Techniciens vérifiés: 1
🔍 Comptage des demandes ouvertes...
✅ Demandes ouvertes: 3
🔍 Comptage des KYC en attente...
✅ KYC en attente: 1
```

Si vous ne voyez pas ces logs:
1. Vérifier que vous êtes bien connecté
2. Vérifier que la page est bien chargée
3. Vérifier qu'il n'y a pas d'erreur JavaScript

### Contacter le support

Si le problème persiste, fournir:
1. Capture d'écran de la console (F12)
2. Capture d'écran de Firestore Console
3. Message d'erreur exact

## 📚 Documentation associée

- `FIREBASE_AUTH_SETUP.md` - Configuration Firebase
- `DASHBOARD_UPDATE.md` - Détails du dashboard
- `FIRESTORE_SCHEMA.md` - Schéma de la base de données

---

**Créé le**: 18 Novembre 2024  
**Mis à jour**: 18 Novembre 2024
