# Guide de Démarrage - REPA Admin Dashboard

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Firebase
- Clés Firebase du projet REPA

## 🚀 Installation

### 1. Cloner le projet

```bash
cd /Users/elykik/Documents/Dev/repa-admin
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=repa-ef227.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=repa-ef227
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=repa-ef227.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=768385093157
NEXT_PUBLIC_FIREBASE_APP_ID=1:768385093157:web:xxx

# Admin Configuration
ADMIN_EMAIL=admin@repa.com
ADMIN_PASSWORD=your_secure_password
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera disponible à `http://localhost:3000`

## 🔐 Configuration Firebase

### Obtenir les clés Firebase

1. Aller à [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner le projet "repa-ef227"
3. Aller à **Project Settings** → **General**
4. Copier les clés dans `.env.local`

### Activer les services

1. **Authentication**
   - Aller à **Authentication** → **Sign-in method**
   - Activer : Email/Password

2. **Firestore Database**
   - Aller à **Firestore Database**
   - Vérifier que la base existe

3. **Storage**
   - Aller à **Storage**
   - Vérifier que le bucket existe

## 📁 Structure du Projet

```
repa-admin/
├── src/
│   ├── app/                    # Pages Next.js
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Accueil
│   │   ├── globals.css         # Styles globaux
│   │   ├── kyc/                # Pages KYC
│   │   ├── users/              # Pages utilisateurs
│   │   ├── statistics/         # Pages statistiques
│   │   └── login/              # Page de connexion
│   ├── components/             # Composants React
│   │   ├── layout/             # Layout components
│   │   ├── kyc/                # KYC components
│   │   ├── dashboard/          # Dashboard components
│   │   └── common/             # Composants réutilisables
│   ├── lib/                    # Utilitaires
│   │   ├── firebase.ts         # Configuration Firebase
│   │   ├── api.ts              # Appels API
│   │   └── utils.ts            # Fonctions utilitaires
│   └── types/                  # Types TypeScript
│       └── index.ts            # Définitions de types
├── public/                     # Fichiers statiques
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🎯 Fonctionnalités Principales

### Tableau de Bord
- Vue d'ensemble des statistiques
- Raccourcis vers les pages principales
- Affichage des KYC en attente

### Gestion KYC
- Liste des vérifications
- Filtrage par statut (PENDING, VERIFIED, REJECTED)
- Affichage des documents
- Approbation/Rejet avec raison
- Notifications automatiques

### Gestion Utilisateurs
- Liste des utilisateurs
- Filtrage par rôle
- Gestion des permissions
- Suppression de comptes

### Statistiques
- Graphiques KYC
- Statistiques d'utilisation
- Rapports mensuels

## 🔧 Commandes Utiles

### Développement

```bash
# Démarrer le serveur
npm run dev

# Linting
npm run lint

# Type checking
npm run type-check

# Build
npm run build

# Production
npm run start
```

### Debugging

```bash
# Voir les logs
npm run dev -- --verbose

# Ouvrir DevTools
# Appuyer sur F12 dans le navigateur
```

## 📝 Créer une Nouvelle Page

### 1. Créer le dossier

```bash
mkdir -p src/app/ma-page
```

### 2. Créer le fichier page.tsx

```typescript
'use client'

export default function MaPage() {
  return (
    <div>
      <h1>Ma Page</h1>
    </div>
  )
}
```

### 3. Ajouter la route dans la navigation

Modifier `src/components/layout/Sidebar.tsx` pour ajouter le lien.

## 🎨 Créer un Nouveau Composant

### 1. Créer le fichier

```bash
touch src/components/common/MonComposant.tsx
```

### 2. Écrire le composant

```typescript
'use client'

interface Props {
  titre: string
  contenu: string
}

export default function MonComposant({ titre, contenu }: Props) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold">{titre}</h2>
      <p>{contenu}</p>
    </div>
  )
}
```

### 3. Utiliser le composant

```typescript
import MonComposant from '@/components/common/MonComposant'

export default function MaPage() {
  return (
    <MonComposant 
      titre="Mon Titre" 
      contenu="Mon contenu"
    />
  )
}
```

## 🔗 Appeler l'API Firebase

### Exemple : Récupérer les KYC

```typescript
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

async function getKYCVerifications() {
  const q = query(
    collection(db, 'kyc_verifications'),
    where('status', '==', 'IN_PROGRESS')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data())
}
```

## 🐛 Troubleshooting

### Erreur : "Cannot find module"

**Solution** : Vérifier que le fichier existe et que le chemin est correct.

### Erreur : "Firebase is not initialized"

**Solution** : Vérifier que `.env.local` contient les bonnes clés Firebase.

### Erreur : "Permission denied"

**Solution** : Vérifier les règles Firestore et Storage.

### Port 3000 déjà utilisé

**Solution** : 
```bash
# Utiliser un autre port
npm run dev -- -p 3001
```

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Firebase Hosting

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

### Docker

```bash
# Build l'image
docker build -t repa-admin .

# Lancer le conteneur
docker run -p 3000:3000 repa-admin
```

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs
3. Contacter l'équipe REPA

---

**Créé le** : 13 novembre 2024
**Statut** : ✅ Prêt pour le développement
