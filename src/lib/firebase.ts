import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;

try {
  // Inicjalizacja Firebase
  app = initializeApp(firebaseConfig);
  
  // Inicjalizacja Firestore
  db = getFirestore(app);
  
  // Inicjalizacja Analytics (tylko w przeglądarce)
  if (typeof window !== 'undefined') {
    isSupported().then(supported => {
      if (supported && app) {
        analytics = getAnalytics(app);
        console.log('✅ Firebase initialized successfully with Analytics');
      } else {
        console.log('✅ Firebase initialized successfully (Analytics not supported)');
      }
    });
  } else {
    console.log('✅ Firebase initialized successfully (server-side)');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.log('\n⚠️  UWAGA: Sprawdź konfigurację Firebase!');
  console.log('Przejdź do FIREBASE_SETUP.md aby uzyskać instrukcje konfiguracji.');
}

export { db, analytics };
export default app;
