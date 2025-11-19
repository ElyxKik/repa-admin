/**
 * Script pour créer un utilisateur administrateur
 * 
 * Usage:
 *   node scripts/create-admin.js
 * 
 * Ce script nécessite firebase-admin et un fichier de service account
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Interface pour lire les entrées utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  try {
    console.log('\n🔐 Création d\'un utilisateur administrateur REPA\n');

    // Demander les informations
    const email = await question('Email de l\'admin: ');
    const password = await question('Mot de passe (min 6 caractères): ');
    const displayName = await question('Nom complet: ');

    if (!email || !password || !displayName) {
      console.error('❌ Tous les champs sont requis');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Le mot de passe doit contenir au moins 6 caractères');
      process.exit(1);
    }

    console.log('\n⏳ Création de l\'utilisateur...\n');

    // Initialiser Firebase Admin (assurez-vous d'avoir configuré les credentials)
    if (!admin.apps.length) {
      // Option 1: Utiliser les credentials par défaut de l'application
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    }

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true
    });

    console.log('✅ Utilisateur créé dans Firebase Auth');
    console.log(`   UID: ${userRecord.uid}`);

    // Créer le document dans Firestore
    const now = new Date().toISOString();
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      photoURL: null,
      phoneNumber: null,
      role: 'ADMIN',
      isVerified: true,
      isVIP: false,
      ville: null,
      location: null,
      rating: 0,
      reviewCount: 0,
      hourlyRate: 0,
      specialties: [],
      createdAt: now,
      updatedAt: now
    });

    console.log('✅ Document créé dans Firestore (collection: users)');
    console.log('\n🎉 Utilisateur administrateur créé avec succès!\n');
    console.log('Détails de connexion:');
    console.log(`   Email: ${email}`);
    console.log(`   Rôle: ADMIN`);
    console.log(`   UID: ${userRecord.uid}\n`);
    console.log('Vous pouvez maintenant vous connecter au dashboard admin.\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de la création de l\'utilisateur:');
    
    if (error.code === 'auth/email-already-exists') {
      console.error('   Cet email est déjà utilisé');
    } else if (error.code === 'auth/invalid-email') {
      console.error('   Email invalide');
    } else if (error.code === 'auth/weak-password') {
      console.error('   Mot de passe trop faible');
    } else {
      console.error(`   ${error.message}`);
    }
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Exécuter le script
createAdminUser();
