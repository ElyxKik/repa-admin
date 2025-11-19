# 🔧 Diagnostic - Page Détails KYC

## Problème : La page de détails KYC n'affiche pas de données réelles

### ✅ Solutions

#### 1. Vérifier qu'il y a des données dans Firestore

**Option A : Via Firebase Console**
1. Aller sur https://console.firebase.google.com/project/repa-ef227/firestore
2. Vérifier les collections :
   - `kyc_verifications` : Doit contenir au moins 1 document
   - `kyc_documents` : Doit contenir des documents
   - `users` : Doit contenir des techniciens

**Option B : Créer des données de test**
```bash
cd /Users/elykik/Documents/Dev/repa-admin
node scripts/seed-kyc.js
```

#### 2. Vérifier les logs de la console

Ouvrir la console du navigateur (F12) et vérifier :

**Logs attendus :**
```
🔍 Chargement KYC ID: abc123...
✅ KYC Data: {id: "abc123", technicianId: "xyz789", ...}
🔍 Chargement technicien: xyz789
✅ Technicien chargé: Marc Durand
🔍 Chargement documents: 2
✅ Document chargé: doc1
✅ Document chargé: doc2
✅ Total documents chargés: 2
✅ Vérification complète chargée
```

**Si vous voyez :**
- `❌ Vérification KYC non trouvée` → L'ID n'existe pas dans Firestore
- `⚠️ Technicien non trouvé` → Le technicianId n'existe pas dans users
- `⚠️ Document non trouvé` → Les documentIds n'existent pas dans kyc_documents

#### 3. Vérifier la structure des données

**Collection `kyc_verifications`:**
```json
{
  "technicianId": "user_id_here",
  "status": "IN_PROGRESS",
  "documentIds": ["doc1_id", "doc2_id"],
  "selfieImageUrl": "https://...",
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

**Collection `kyc_documents`:**
```json
{
  "technicianId": "user_id_here",
  "documentType": "ID_CARD",
  "documentNumber": "AB123456",
  "frontImageUrl": "https://...",
  "backImageUrl": "https://...",
  "expiryDate": "2026-12-31",
  "status": "PENDING",
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

**Collection `users` (technicien):**
```json
{
  "uid": "user_id_here",
  "email": "technicien@repa.com",
  "displayName": "Marc Durand",
  "phoneNumber": "+33612345678",
  "role": "TECHNICIAN",
  "isVerified": false,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

#### 4. Vérifier les règles Firestore

Les règles doivent permettre la lecture :

```javascript
// kyc_verifications
match /kyc_verifications/{verificationId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin();
}

// kyc_documents
match /kyc_documents/{documentId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin() || isOwner(resource.data.technicianId);
}

// users
match /users/{userId} {
  allow read: if isAuthenticated();
}
```

#### 5. Tester manuellement

**Étape 1 : Créer des données de test**
```bash
node scripts/seed-kyc.js
```

**Étape 2 : Aller sur la page KYC**
```
http://localhost:3000/kyc
```

**Étape 3 : Cliquer sur "Examiner"**
Vous devriez voir :
- Informations du technicien
- Documents d'identité avec images
- Photo selfie
- Boutons d'approbation/rejet

#### 6. Vérifier les permissions Firebase

Si vous voyez des erreurs de permission :

1. **Vérifier que vous êtes connecté en tant qu'admin**
2. **Vérifier les règles Firestore** (voir étape 4)
3. **Redéployer les règles** :
   ```bash
   firebase deploy --only firestore:rules
   ```

### 🐛 Erreurs courantes

#### Erreur : "Vérification KYC non trouvée"
**Cause :** L'ID dans l'URL n'existe pas dans Firestore
**Solution :** Vérifier que l'ID est correct ou créer des données de test

#### Erreur : "Missing or insufficient permissions"
**Cause :** Les règles Firestore bloquent l'accès
**Solution :** Mettre à jour les règles Firestore (voir étape 4)

#### Erreur : Documents vides
**Cause :** Les `documentIds` pointent vers des documents inexistants
**Solution :** Vérifier que les documents existent dans `kyc_documents`

#### Erreur : Technicien "inconnu"
**Cause :** Le `technicianId` n'existe pas dans `users`
**Solution :** Créer le document utilisateur correspondant

### 📊 Données de test créées par le script

Le script `seed-kyc.js` crée :
- ✅ 1 technicien (Marc Durand)
- ✅ 2 documents KYC (Carte d'identité + Passeport)
- ✅ 1 vérification KYC avec statut "IN_PROGRESS"
- ✅ Images placeholder pour visualisation

### 🔍 Vérification finale

1. **Console du navigateur** : Pas d'erreurs rouges
2. **Page KYC** : Liste affichée avec au moins 1 élément
3. **Page détails** : Toutes les sections affichées
4. **Images** : Visibles et cliquables
5. **Boutons** : Approuver/Rejeter fonctionnels

### 💡 Besoin d'aide ?

Si le problème persiste :
1. Copier les logs de la console
2. Vérifier la structure des données dans Firestore
3. Vérifier que les règles Firestore sont correctes
4. Redémarrer le serveur de développement
