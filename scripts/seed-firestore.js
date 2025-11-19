/**
 * Script pour ajouter des données de test dans Firestore
 * 
 * Usage:
 *   node scripts/seed-firestore.js
 * 
 * Ce script ajoute des utilisateurs, demandes de réparation et KYC de test
 */

const admin = require('firebase-admin');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'repa-ef227'
  });
}

const db = admin.firestore();

async function seedData() {
  console.log('🌱 Début du seeding de Firestore...\n');

  try {
    // 1. Créer des utilisateurs de test
    console.log('👥 Création des utilisateurs...');
    
    const users = [
      {
        uid: 'client_001',
        email: 'client1@repa.com',
        displayName: 'Jean Dupont',
        phoneNumber: '+33612345678',
        role: 'CLIENT',
        isVerified: true,
        isVIP: false,
        ville: 'Paris',
        location: { latitude: 48.8566, longitude: 2.3522 },
        rating: 4.5,
        reviewCount: 12,
        hourlyRate: 0,
        specialties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        uid: 'tech_001',
        email: 'tech1@repa.com',
        displayName: 'Marc Durand',
        phoneNumber: '+33687654321',
        role: 'TECHNICIAN',
        isVerified: true,
        isVIP: false,
        ville: 'Lyon',
        location: { latitude: 45.7640, longitude: 4.8357 },
        rating: 4.8,
        reviewCount: 45,
        hourlyRate: 50,
        specialties: ['PHONE', 'LAPTOP'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        uid: 'tech_002',
        email: 'tech2@repa.com',
        displayName: 'Sophie Martin',
        phoneNumber: '+33698765432',
        role: 'TECHNICIAN',
        isVerified: false,
        isVIP: false,
        ville: 'Marseille',
        location: { latitude: 43.2965, longitude: 5.3698 },
        rating: 0,
        reviewCount: 0,
        hourlyRate: 45,
        specialties: ['TABLET', 'PHONE'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const user of users) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`  ✅ Utilisateur créé: ${user.displayName} (${user.role})`);
    }

    // 2. Créer des demandes de réparation
    console.log('\n🔧 Création des demandes de réparation...');
    
    const repairRequests = [
      {
        clientId: 'client_001',
        technicianId: null,
        title: 'Écran cassé iPhone 13',
        description: 'L\'écran est complètement cassé suite à une chute',
        category: 'PHONE',
        status: 'OPEN',
        location: {
          latitude: 48.8566,
          longitude: 2.3522,
          address: '123 Rue de Paris, 75001 Paris'
        },
        images: [],
        estimatedPrice: 150.00, // Prix en dollars
        finalPrice: null,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        completedAt: null
      },
      {
        clientId: 'client_001',
        technicianId: 'tech_001',
        title: 'Batterie MacBook défectueuse',
        description: 'La batterie ne tient plus la charge',
        category: 'LAPTOP',
        status: 'ASSIGNED',
        location: {
          latitude: 48.8566,
          longitude: 2.3522,
          address: '123 Rue de Paris, 75001 Paris'
        },
        images: [],
        estimatedPrice: 200.00,
        finalPrice: null,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        completedAt: null
      },
      {
        clientId: 'client_001',
        technicianId: 'tech_001',
        title: 'Problème de charge iPad',
        description: 'L\'iPad ne charge plus',
        category: 'TABLET',
        status: 'IN_PROGRESS',
        location: {
          latitude: 48.8566,
          longitude: 2.3522,
          address: '123 Rue de Paris, 75001 Paris'
        },
        images: [],
        estimatedPrice: 120.00,
        finalPrice: null,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        completedAt: null
      }
    ];

    for (const request of repairRequests) {
      const docRef = await db.collection('repair_requests').add(request);
      console.log(`  ✅ Demande créée: ${request.title} (${request.status})`);
    }

    // 3. Créer des vérifications KYC
    console.log('\n📋 Création des vérifications KYC...');
    
    const kycVerifications = [
      {
        id: 'kyc_tech_001',
        technicianId: 'tech_001',
        status: 'VERIFIED',
        documentIds: ['doc_001'],
        selfieImageUrl: 'https://example.com/selfie1.jpg',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'admin_001',
        rejectionReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'kyc_tech_002',
        technicianId: 'tech_002',
        status: 'IN_PROGRESS',
        documentIds: ['doc_002'],
        selfieImageUrl: 'https://example.com/selfie2.jpg',
        verifiedAt: null,
        verifiedBy: null,
        rejectionReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const kyc of kycVerifications) {
      await db.collection('kyc_verifications').doc(kyc.id).set(kyc);
      console.log(`  ✅ KYC créé: ${kyc.technicianId} (${kyc.status})`);
    }

    // 4. Créer des documents KYC
    console.log('\n📄 Création des documents KYC...');
    
    const kycDocuments = [
      {
        id: 'doc_001',
        technicianId: 'tech_001',
        documentType: 'ID_CARD',
        documentNumber: '123456789',
        frontImageUrl: 'https://example.com/id_front.jpg',
        backImageUrl: 'https://example.com/id_back.jpg',
        expiryDate: '2025-12-31',
        uploadedAt: new Date().toISOString(),
        status: 'VERIFIED',
        rejectionReason: null
      },
      {
        id: 'doc_002',
        technicianId: 'tech_002',
        documentType: 'PASSPORT',
        documentNumber: '987654321',
        frontImageUrl: 'https://example.com/passport.jpg',
        backImageUrl: null,
        expiryDate: '2026-06-30',
        uploadedAt: new Date().toISOString(),
        status: 'PENDING',
        rejectionReason: null
      }
    ];

    for (const doc of kycDocuments) {
      await db.collection('kyc_documents').doc(doc.id).set(doc);
      console.log(`  ✅ Document créé: ${doc.documentType} (${doc.status})`);
    }

    console.log('\n✨ Seeding terminé avec succès!\n');
    console.log('📊 Résumé:');
    console.log(`  - ${users.length} utilisateurs créés`);
    console.log(`  - ${repairRequests.length} demandes de réparation créées`);
    console.log(`  - ${kycVerifications.length} vérifications KYC créées`);
    console.log(`  - ${kycDocuments.length} documents KYC créés\n`);

  } catch (error) {
    console.error('\n❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

// Exécuter le script
seedData().then(() => {
  console.log('✅ Script terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
