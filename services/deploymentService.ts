import { db } from './firebaseConfig';
import { collection, addDoc, onSnapshot, doc, DocumentSnapshot } from 'firebase/firestore';
import { GeneratedApp, BuildJob } from '../types';

/**
 * ARCHITECTURE NOTE:
 * Since we cannot run 'eas build' (which is a Node.js CLI tool) directly in the browser,
 * we use a "Job Queue" pattern with Firebase.
 * 
 * 1. Frontend: Writes a 'build job' to Firestore.
 * 2. Backend (Cloud Function): Listens to new jobs, runs 'eas build', and updates Firestore with logs.
 * 
 * --- BACKEND CODE SNIPPET (Node.js Cloud Function) ---
 * 
 * exports.onBuildQueued = onDocumentCreated("builds/{buildId}", async (event) => {
 *   const { token, code } = event.data.data();
 *   const buildId = event.params.buildId;
 *   
 *   // 1. Authenticate with Expo (requires EXPO_TOKEN env var or passed token)
 *   // 2. Write 'code' to App.js
 *   // 3. Run 'eas build --platform android --json --non-interactive'
 *   
 *   // Stream logs back to Firestore:
 *   await event.data.ref.update({ 
 *     logs: FieldValue.arrayUnion("Starting build..."),
 *     status: 'building'
 *   });
 * });
 */

export const startDeployJob = async (token: string, appData: GeneratedApp): Promise<string> => {
  if (!db) throw new Error("Firebase not configured");
  
  try {
    const docRef = await addDoc(collection(db, 'builds'), {
      token,
      code: appData.reactNativeCode,
      appName: appData.name,
      status: 'queued',
      logs: ['> Job submitted to Firebase Job Queue...'],
      createdAt: Date.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating build job:", error);
    throw error;
  }
};

export const subscribeToBuild = (
  buildId: string, 
  onUpdate: (job: BuildJob) => void
) => {
  if (!db) return () => {};
  
  return onSnapshot(doc(db, 'builds', buildId), (docSnap: DocumentSnapshot) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onUpdate({
        id: docSnap.id,
        status: data.status,
        logs: data.logs || [],
        buildUrl: data.buildUrl,
        createdAt: data.createdAt
      } as BuildJob);
    }
  }, (error) => {
    console.error("Error listening to build:", error);
  });
};