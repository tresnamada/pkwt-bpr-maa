import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function exportData() {
  try {
    console.log('Exporting employees...');
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employees = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('Exporting reminders...');
    const remindersSnapshot = await getDocs(collection(db, 'reminders'));
    const reminders = remindersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const data = {
      employees,
      reminders,
      exportedAt: new Date().toISOString(),
    };

    fs.writeFileSync('firestore-export.json', JSON.stringify(data, null, 2));
    console.log('✓ Data exported to firestore-export.json');
    console.log(`  - Employees: ${employees.length}`);
    console.log(`  - Reminders: ${reminders.length}`);
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}

exportData();
