# Guide de Validation KYC - REPA Admin Dashboard

## 📋 Vue d'Ensemble

Le système de validation KYC (Know Your Customer) est un module complet permettant aux techniciens et administrateurs de vérifier l'identité des utilisateurs. Le système utilise un système de rôles pour contrôler l'accès aux fonctionnalités de validation.

## 👥 Système de Rôles

### 1. **Client** (Lecture seule)
- ✅ Peut consulter ses propres informations KYC
- ❌ Ne peut pas valider d'autres vérifications
- ❌ Ne peut pas approuver ou rejeter
- **Accès**: Pages de consultation uniquement

### 2. **Technicien** (Validation complète)
- ✅ Peut examiner toutes les vérifications KYC
- ✅ Peut approuver les vérifications
- ✅ Peut rejeter avec raison obligatoire
- ✅ Accès à tous les détails des documents
- **Accès**: Pages de validation et gestion complète

### 3. **Administrateur** (Accès complet)
- ✅ Accès complet comme technicien
- ✅ Gestion des utilisateurs et rôles
- ✅ Accès aux statistiques avancées
- **Accès**: Toutes les pages

## 🔍 Page de Validation KYC Détaillée

### Accès à la Page
1. Allez à `/kyc` pour voir la liste des vérifications
2. Cliquez sur le bouton **"Examiner"** pour accéder à la page de validation détaillée
3. URL: `/kyc/[id]` où `[id]` est l'ID de la vérification

### Éléments Affichés

#### 📝 Informations Personnelles
- Nom complet
- Email
- Téléphone
- Date de naissance
- Nationalité
- Adresse

#### 📄 Documents d'Identité
Chaque document affiche:
- **Type**: Carte d'Identité, Passeport, Permis de Conduire, etc.
- **Numéro**: Numéro du document
- **Date d'expiration**: Vérification de validité
- **Images**: Recto et verso (le cas échéant)
- **Statut**: Vérifié, En attente, Rejeté

#### 🤳 Photo de Vérification (Selfie)
- Image haute résolution
- Vérification de correspondance avec les documents

#### 🔎 Visionneur d'Images
- Cliquez sur une image pour l'agrandir
- Contrôles de zoom (1% à 300%)
- Fermeture avec le bouton X ou Échap

### 🎯 Processus de Validation

#### Pour les Techniciens/Administrateurs:

1. **Examiner les Détails**
   - Consultez toutes les informations personnelles
   - Vérifiez les documents et leurs dates d'expiration
   - Comparez le selfie avec les documents

2. **Checklist de Vérification**
   - ✓ Documents valides
   - ✓ Selfie correspond
   - ✓ Données cohérentes
   - ✓ Aucun document expiré

3. **Approuver**
   - Cliquez sur le bouton **"Approuver"**
   - La vérification est marquée comme approuvée
   - L'utilisateur reçoit une notification

4. **Rejeter**
   - Cliquez sur le bouton **"Rejeter"**
   - Un formulaire apparaît pour entrer la raison
   - La raison est obligatoire
   - Cliquez sur **"Confirmer"** pour valider le rejet

### ⚙️ Changement de Rôle (Mode Démo)

Pour tester les différents rôles:

1. Localisez le **sélecteur de rôle** en haut à droite du dashboard
2. Cliquez dessus pour voir les options disponibles
3. Sélectionnez un rôle:
   - **Client**: Accès limité
   - **Technicien**: Validation complète
   - **Administrateur**: Accès complet
4. La page se recharge avec le nouveau rôle

### 🚫 Restrictions d'Accès

#### Clients
```
Vous n'avez pas les permissions pour valider cette vérification.
Seuls les techniciens et administrateurs peuvent valider les vérifications KYC.
```

#### Techniciens/Administrateurs
- Accès complet aux boutons d'approbation/rejet
- Accès à tous les détails des documents
- Historique des validations

## 📊 Statuts de Vérification

| Statut | Description | Actions Possibles |
|--------|-------------|-------------------|
| **Pending** | En attente de validation | Approuver, Rejeter |
| **Review** | En révision | Approuver, Rejeter |
| **Approved** | Approuvée | Voir détails |
| **Rejected** | Rejetée | Voir raison |

## 🔐 Sécurité

- Les données sont chiffrées en transit
- Les images sont stockées de manière sécurisée
- Les actions de validation sont enregistrées
- Audit trail complet des modifications

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1366px - 1920px)
- ✅ Tablet (768px - 1366px)
- ✅ Mobile (< 768px)

## 🔗 Routes Disponibles

| Route | Description | Rôles Autorisés |
|-------|-------------|-----------------|
| `/kyc` | Liste des vérifications | Tous |
| `/kyc/[id]` | Détails de validation | Tous (lecture/écriture selon rôle) |
| `/users` | Gestion des utilisateurs | Admin, Technicien |
| `/statistics` | Statistiques | Admin, Technicien |
| `/settings` | Paramètres | Admin |

## 🐛 Dépannage

### Les boutons d'approbation/rejet ne s'affichent pas
- Vérifiez que vous êtes connecté en tant que Technicien ou Administrateur
- Utilisez le sélecteur de rôle en haut à droite

### Les images ne s'affichent pas
- Vérifiez votre connexion Internet
- Essayez de rafraîchir la page
- Vérifiez que les URLs des images sont valides

### Impossible de rejeter une vérification
- Assurez-vous d'avoir entré une raison de rejet
- La raison est obligatoire pour le rejet

## 📞 Support

Pour toute question ou problème:
- Contactez l'équipe support
- Consultez la documentation complète
- Vérifiez les logs du serveur

---

**Version**: 1.0  
**Dernière mise à jour**: 2024-11-13  
**Statut**: Production
