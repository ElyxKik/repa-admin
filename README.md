# REPA Admin Dashboard

Tableau de bord d'administration pour la plateforme REPA avec gestion complète du KYC et des utilisateurs.

## 🚀 Démarrage Rapide

### Installation

```bash
cd repa-admin
npm install
```

### Configuration

1. Copier `.env.local.example` en `.env.local`
2. Ajouter les clés Firebase
3. Configurer les identifiants admin

### Développement

```bash
npm run dev
```

L'application sera disponible à `http://localhost:3000`

## 📁 Structure du Projet

```
repa-admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── globals.css         # Styles globaux
│   │   ├── kyc/                # Pages KYC
│   │   ├── users/              # Pages utilisateurs
│   │   ├── statistics/         # Pages statistiques
│   │   └── login/              # Page de connexion
│   ├── components/
│   │   ├── layout/             # Composants de layout
│   │   ├── kyc/                # Composants KYC
│   │   ├── dashboard/          # Composants dashboard
│   │   └── common/             # Composants réutilisables
│   ├── lib/
│   │   ├── firebase.ts         # Configuration Firebase
│   │   ├── api.ts              # Appels API
│   │   └── utils.ts            # Utilitaires
│   └── types/
│       └── index.ts            # Types TypeScript
├── public/                      # Fichiers statiques
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔐 Authentification

### Login Admin

- Email: `admin@repa.com`
- Mot de passe: À configurer dans `.env.local`

### Sécurité

- Authentification Firebase
- Tokens JWT
- Vérification des rôles

## 📊 Fonctionnalités

### KYC Management
- ✅ Liste des vérifications en attente
- ✅ Filtrage par statut
- ✅ Affichage des documents
- ✅ Approbation/Rejet
- ✅ Notifications automatiques

### User Management
- ✅ Liste des utilisateurs
- ✅ Filtrage par rôle
- ✅ Gestion des permissions
- ✅ Suppression de comptes

### Statistics
- ✅ Statistiques KYC
- ✅ Graphiques d'utilisation
- ✅ Rapports mensuels

## 🛠️ Technologies

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Auth**: Firebase Authentication
- **State**: Zustand
- **UI Components**: Lucide React

## 📦 Scripts

```bash
# Développement
npm run dev

# Build
npm run build

# Production
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🔗 Intégration Firebase

### Configuration Requise

1. Créer un projet Firebase
2. Activer Authentication (Email/Password)
3. Créer une base Firestore
4. Créer un bucket Storage
5. Ajouter les clés dans `.env.local`

### Collections Firestore

- `users` - Profils utilisateurs
- `kyc_verifications` - Vérifications KYC
- `kyc_documents` - Documents KYC
- `notifications` - Notifications

### Règles de Sécurité

Les règles sont définies dans le projet Flutter REPA :
- `firestore.rules`
- `storage.rules`

## 📱 Pages Principales

### `/` - Tableau de Bord
- Vue d'ensemble
- Statistiques
- Raccourcis

### `/kyc` - Gestion KYC
- Liste des vérifications
- Détails des documents
- Approbation/Rejet

### `/users` - Gestion Utilisateurs
- Liste des utilisateurs
- Filtrage
- Gestion des rôles

### `/statistics` - Statistiques
- Graphiques
- Rapports
- Exports

### `/login` - Connexion
- Authentification admin
- Récupération de mot de passe

## 🚀 Déploiement

### Vercel

```bash
vercel deploy
```

### Docker

```bash
docker build -t repa-admin .
docker run -p 3000:3000 repa-admin
```

### Firebase Hosting

```bash
firebase deploy --only hosting
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou problème, contactez l'équipe REPA.

---

**Version**: 1.0.0
**Dernière mise à jour**: 13 novembre 2024
