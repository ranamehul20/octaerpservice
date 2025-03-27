import admin from "firebase-admin";
import serviceAccount from "../octa-society-firebase-adminsdk-qsa1p-a8f2732f75.json" assert { type: "json" };
let firebaseApp;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}else {
    firebaseApp = admin.app(); // Use the existing app
}

export default firebaseApp;