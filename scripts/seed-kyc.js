const admin = require('firebase-admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function seedKYCData() {
  try {
    console.log('\n🔐 Ajout de données KYC de test dans Firestore\n');

    // Initialiser Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'repa-ef227'
      });
    }

    const db = admin.firestore();

    // 1. Créer un technicien de test
    console.log('📝 Création d\'un technicien de test...');
    const technicianRef = db.collection('users').doc();
    const technicianId = technicianRef.id;
    
    await technicianRef.set({
      uid: technicianId,
      email: 'technicien.test@repa.com',
      displayName: 'Marc Durand',
      phoneNumber: '+33612345678',
      role: 'TECHNICIAN',
      isVerified: false,
      ville: 'Paris',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    console.log('✅ Technicien créé:', technicianId);

    // 2. Créer des documents KYC
    console.log('\n📄 Création de documents KYC...');
    const doc1Ref = db.collection('kyc_documents').doc();
    const doc1Id = doc1Ref.id;
    
    await doc1Ref.set({
      technicianId: technicianId,
      documentType: 'ID_CARD',
      documentNumber: 'AB123456',
      frontImageUrl: 'https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Carte+Identite+Recto',
      backImageUrl: 'https://via.placeholder.com/400x250/2196F3/FFFFFF?text=Carte+Identite+Verso',
      expiryDate: '2026-12-31',
      status: 'PENDING',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    console.log('✅ Document 1 créé:', doc1Id);

    const doc2Ref = db.collection('kyc_documents').doc();
    const doc2Id = doc2Ref.id;
    
    await doc2Ref.set({
      technicianId: technicianId,
      documentType: 'PASSPORT',
      documentNumber: 'PA987654',
      frontImageUrl: 'https://via.placeholder.com/400x250/FF9800/FFFFFF?text=Passeport',
      expiryDate: '2028-06-15',
      status: 'PENDING',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    console.log('✅ Document 2 créé:', doc2Id);

    // 3. Créer une vérification KYC
    console.log('\n✅ Création de la vérification KYC...');
    const kycRef = db.collection('kyc_verifications').doc();
    const kycId = kycRef.id;
    
    await kycRef.set({
      technicianId: technicianId,
      status: 'IN_PROGRESS',
      documentIds: [doc1Id, doc2Id],
      selfieImageUrl: 'https://via.placeholder.com/400x500/9C27B0/FFFFFF?text=Photo+Selfie',
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    console.log('✅ Vérification KYC créée:', kycId);

    console.log('\n🎉 Données KYC de test créées avec succès!\n');
    console.log('📋 Résumé:');
    console.log(`   Technicien ID: ${technicianId}`);
    console.log(`   Email: technicien.test@repa.com`);
    console.log(`   KYC ID: ${kycId}`);
    console.log(`   Documents: ${doc1Id}, ${doc2Id}`);
    console.log('\n💡 Vous pouvez maintenant:');
    console.log(`   1. Aller sur /kyc pour voir la liste`);
    console.log(`   2. Cliquer sur "Examiner" pour voir les détails`);
    console.log(`   3. Approuver ou rejeter la vérification\n`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la création des données:', error);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Exécuter le script
seedKYCData();
