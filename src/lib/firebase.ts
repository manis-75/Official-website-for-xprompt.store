import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBEv4LYkGfbxkIAPDTzmwIX96NrOf4AooA",
  authDomain: "promptxp-93dc7.firebaseapp.com",
  projectId: "promptxp-93dc7",
  storageBucket: "promptxp-93dc7.firebasestorage.app",
  messagingSenderId: "880763880555",
  appId: "1:880763880555:web:fd8742bde90973d0ea5d2e",
  measurementId: "G-RPGXKG54RN"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connected successfully!");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    } else if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      console.warn("Firebase is connected, but Firestore rules are blocking access. Please update your rules in the Firebase Console.");
    }
  }
}
testConnection();
