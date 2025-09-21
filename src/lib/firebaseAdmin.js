import 'server-only';
import { getApps, getApp, initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Prefer explicit service account creds via env; fall back to ADC if available.
const {
  FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_SERVICE_ACCOUNT
} = process.env;

function buildCredentials() {
  if (FIREBASE_SERVICE_ACCOUNT) {
    try {
      const json = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
      return cert(json);
    } catch (e) {
      console.warn('Invalid FIREBASE_SERVICE_ACCOUNT JSON');
    }
  }
  if (FIREBASE_ADMIN_PROJECT_ID && FIREBASE_ADMIN_CLIENT_EMAIL && FIREBASE_ADMIN_PRIVATE_KEY) {
    const key = FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
    return cert({
      projectId: FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: key,
    });
  }
  return null;
}

let app;
if (!getApps().length) {
  const creds = buildCredentials();
  app = initializeApp(creds ? { credential: creds } : { credential: applicationDefault() });
} else {
  app = getApp();
}

export const adminDb = getFirestore(app);
export default app;
