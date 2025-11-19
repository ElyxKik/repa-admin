# Guide de Test - REPA Admin Dashboard

## 🚀 Démarrage de l'Application

### 1. Installer les dépendances
```bash
npm install
```

### 2. Démarrer le serveur de développement
```bash
npm run dev
```

L'application sera disponible à `http://localhost:3000`

## 🔐 Test de l'Authentification

### 1. Page de Connexion
- Accédez à `http://localhost:3000/login`
- Entrez n'importe quel email et mot de passe
- Cliquez sur "Se Connecter"
- Vous serez redirigé vers le dashboard

### 2. Déconnexion
- Cliquez sur le bouton "Déconnexion" dans la sidebar
- Vous serez redirigé vers la page de login

## 👥 Test des Rôles Utilisateur

### Localiser le Sélecteur de Rôle
- Regardez en haut à droite du dashboard
- Vous verrez votre rôle actuel (Client, Technicien, Administrateur)

### Tester Chaque Rôle

#### 1. **Client** (Accès Limité)
- Cliquez sur le sélecteur de rôle
- Sélectionnez "Client"
- La page se recharge
- Allez à `/kyc/1` pour voir la page de validation
- Vous verrez un message d'accès limité
- Les boutons d'approbation/rejet ne s'affichent pas

#### 2. **Technicien** (Validation Complète)
- Cliquez sur le sélecteur de rôle
- Sélectionnez "Technicien"
- La page se recharge
- Allez à `/kyc/1` pour voir la page de validation
- Vous pouvez voir tous les détails
- Les boutons d'approbation/rejet s'affichent
- Vous pouvez approuver ou rejeter

#### 3. **Administrateur** (Accès Complet)
- Cliquez sur le sélecteur de rôle
- Sélectionnez "Administrateur"
- La page se recharge
- Accès complet à toutes les pages
- Tous les boutons d'action sont disponibles

## 📋 Test des Pages Principales

### 1. Dashboard (`/`)
- [ ] Vérifiez que les statistiques s'affichent
- [ ] Vérifiez que le tableau KYC récent s'affiche
- [ ] Vérifiez que les raccourcis fonctionnent
- [ ] Cliquez sur les liens pour naviguer

### 2. Gestion KYC (`/kyc`)
- [ ] Vérifiez la liste des vérifications
- [ ] Testez la recherche par nom/email
- [ ] Testez le filtrage par statut
- [ ] Vérifiez les statistiques
- [ ] Cliquez sur "Examiner" pour voir les détails

### 3. Détails KYC (`/kyc/[id]`)
- [ ] Vérifiez les informations personnelles
- [ ] Vérifiez les documents d'identité
- [ ] Vérifiez la photo de selfie
- [ ] Cliquez sur les images pour les agrandir
- [ ] Testez le zoom sur les images
- [ ] Testez l'approbation (si Technicien/Admin)
- [ ] Testez le rejet avec raison (si Technicien/Admin)

### 4. Gestion Utilisateurs (`/users`)
- [ ] Vérifiez la liste des utilisateurs
- [ ] Testez la recherche
- [ ] Testez le filtrage par statut
- [ ] Vérifiez les statistiques
- [ ] Testez les boutons d'édition/suppression

### 5. Statistiques (`/statistics`)
- [ ] Vérifiez les métriques clés
- [ ] Vérifiez le graphique de croissance
- [ ] Vérifiez la distribution des statuts
- [ ] Vérifiez l'activité récente

### 6. Paramètres (`/settings`)
- [ ] Testez la modification du profil
- [ ] Testez les toggles de notifications
- [ ] Testez les paramètres de sécurité
- [ ] Cliquez sur "Sauvegarder les modifications"

## 🔍 Test de la Validation KYC

### Flux Complet de Validation

#### 1. Accédez à la Page de Validation
- Allez à `/kyc` (liste des vérifications)
- Cliquez sur "Examiner" pour une vérification

#### 2. Examinez les Détails
- Vérifiez toutes les informations personnelles
- Consultez les documents d'identité
- Vérifiez la photo de selfie
- Utilisez le zoom pour inspecter les détails

#### 3. Approuvez une Vérification (Technicien/Admin)
- Cochez les éléments de la checklist
- Cliquez sur le bouton "Approuver"
- Attendez la confirmation
- Vous verrez une notification de succès

#### 4. Rejetez une Vérification (Technicien/Admin)
- Cliquez sur le bouton "Rejeter"
- Un formulaire apparaît
- Entrez une raison de rejet
- Cliquez sur "Confirmer"
- Vous verrez une notification de succès

## 🎨 Test de l'Interface Utilisateur

### Responsive Design
- [ ] Testez sur Desktop (1920px+)
- [ ] Testez sur Laptop (1366px)
- [ ] Testez sur Tablet (768px)
- [ ] Testez sur Mobile (< 768px)

### Navigation
- [ ] Testez la sidebar collapsible
- [ ] Testez les liens de navigation
- [ ] Testez les breadcrumbs
- [ ] Testez le retour en arrière

### Composants
- [ ] Testez les cartes (cards)
- [ ] Testez les tableaux
- [ ] Testez les modals
- [ ] Testez les notifications toast
- [ ] Testez les badges de statut

## 🔔 Test des Notifications

### Notifications Toast
- [ ] Approuver une vérification → "Vérification KYC approuvée avec succès"
- [ ] Rejeter une vérification → "Vérification KYC rejetée"
- [ ] Supprimer un utilisateur → "Utilisateur supprimé"
- [ ] Sauvegarder les paramètres → "Paramètres sauvegardés avec succès"

## 🐛 Dépannage

### Problème: Les pages ne se chargent pas
**Solution**:
1. Vérifiez que le serveur est en cours d'exécution
2. Vérifiez l'URL
3. Rafraîchissez la page (Ctrl+R ou Cmd+R)
4. Vérifiez la console du navigateur pour les erreurs

### Problème: Les images ne s'affichent pas
**Solution**:
1. Vérifiez votre connexion Internet
2. Vérifiez que les URLs des images sont valides
3. Vérifiez la console du navigateur
4. Essayez d'actualiser la page

### Problème: Les boutons d'action ne s'affichent pas
**Solution**:
1. Vérifiez que vous êtes connecté en tant que Technicien ou Admin
2. Utilisez le sélecteur de rôle pour changer de rôle
3. Vérifiez la console du navigateur pour les erreurs

### Problème: Les données ne se mettent pas à jour
**Solution**:
1. Rafraîchissez la page
2. Vérifiez que vous êtes connecté
3. Vérifiez la console du navigateur
4. Redémarrez le serveur de développement

## 📊 Cas de Test Complets

### Cas 1: Validation Complète d'une Vérification KYC
1. Connectez-vous en tant que Technicien
2. Allez à `/kyc`
3. Cliquez sur "Examiner" pour une vérification
4. Examinez tous les détails
5. Agrandissez les images pour vérifier
6. Approuvez la vérification
7. Vérifiez la notification de succès
8. Retournez à `/kyc` et vérifiez le statut mis à jour

### Cas 2: Rejet d'une Vérification avec Raison
1. Connectez-vous en tant que Technicien
2. Allez à `/kyc`
3. Cliquez sur "Examiner" pour une vérification
4. Cliquez sur "Rejeter"
5. Entrez une raison de rejet
6. Cliquez sur "Confirmer"
7. Vérifiez la notification de succès
8. Retournez à `/kyc` et vérifiez le statut mis à jour

### Cas 3: Test des Permissions par Rôle
1. Allez à `/kyc/1` en tant que Client
2. Vérifiez que vous voyez un message d'accès limité
3. Changez le rôle en Technicien
4. Vérifiez que les boutons d'action s'affichent
5. Changez le rôle en Admin
6. Vérifiez que vous avez accès complet

## ✅ Checklist de Test Final

- [ ] Authentification fonctionne
- [ ] Tous les rôles fonctionnent
- [ ] Toutes les pages se chargent
- [ ] Navigation fonctionne
- [ ] Recherche et filtrage fonctionnent
- [ ] Approbation/rejet fonctionne
- [ ] Images s'affichent et zoomable
- [ ] Notifications toast s'affichent
- [ ] Design responsive fonctionne
- [ ] Pas d'erreurs dans la console

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs du serveur
3. Consultez la documentation
4. Contactez l'équipe support

---

**Bonne chance avec les tests!** 🎉
