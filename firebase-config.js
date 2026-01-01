// Firebase Configuration
// Shared across all pages

const firebaseConfig = {
    apiKey: "AIzaSyC9ppTlooM2LJDRnujz-Wqq_2hwrYIIoWE",
    authDomain: "web-developer-backend.firebaseapp.com",
    projectId: "web-developer-backend",
    storageBucket: "web-developer-backend.firebasestorage.app",
    messagingSenderId: "884344129708",
    appId: "1:884344129708:web:2980f289c622e06915f709"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export services globally (since we are not using modules everywhere yet)
const db = firebase.firestore();
// Add Auth and Storage for the Blog
const auth = firebase.auth();
// Check if storage is available (not included in index.html scripts yet, might need to add script tag)
const storage = firebase.storage ? firebase.storage() : null; 
