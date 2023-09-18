// import { initializeApp } from "firebase/app"
// import {
//     getFirestore,
//     collection,
//     doc,
//     getDocs,
//     getDoc,
//     query,
//     where,
//     documentId
// } from "firebase/firestore/lite"

import { initializeApp } from "firebase/app"
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    documentId
} from "firebase/firestore/lite"
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
 


// const firebaseConfig = {
//     apiKey: "AIzaSyD_k3v3HK3tKEqhlqFHPkwogW7PqEqhGhk",
//     authDomain: "vanlife-a1af5.firebaseapp.com",
//     projectId: "vanlife-a1af5",
//     storageBucket: "vanlife-a1af5.appspot.com",
//     messagingSenderId: "803007000356",
//     appId: "1:803007000356:web:446cd3a1ca406839258db1"
// };

const firebaseConfig = {
    apiKey: "AIzaSyAL7tqTi60gNbWxSFTs1aOUrzVZ-1QZ7sA",
    authDomain: "caravans-2f2f4.firebaseapp.com",
    projectId: "caravans-2f2f4",
    storageBucket: "caravans-2f2f4.appspot.com",
    messagingSenderId: "284142698880",
    appId: "1:284142698880:web:923a5a7db21ee6b32e8165"
  };

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app); // Initialize Firebase Storage

// Refactoring the fetching functions below
const vansCollectionRef = collection(db, "caravans")

export async function getVans() {
    const snapshot = await getDocs(vansCollectionRef)
    const caravans = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
        
    }))
    
    // Add the code to generate downloadable URLs for images
    const caravansWithImages = await Promise.all(caravans.map(async (caravan) => {
        if (caravan.imagePath) {
            const imageRef = ref(storage, caravan.imagePath);
            const imageUrl = await getDownloadURL(imageRef);
            return { ...caravan, imageUrl };
        }
        return caravan;
    }));

    return caravansWithImages;
}

export async function getVan(id) {
    const docRef = doc(db, "caravans", id)
    const snapshot = await getDoc(docRef)
    const caravanData = snapshot.data();
    
    // Check if there's an imagePath property
    if (caravanData.imagePath) {
        const imageRef = ref(storage, caravanData.imagePath);

        try {
            const imageUrl = await getDownloadURL(imageRef);
            return { ...caravanData, id: snapshot.id, imageUrl };
        } catch (error) {
            console.error('Error fetching image URL:', error);
        }
    }

    return { ...caravanData, id: snapshot.id };
}

export async function getHostVans() {
    const q = query(vansCollectionRef, where("hostId", "==", "123"))
    const snapshot = await getDocs(q)
    const caravans = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    
    // Add the code to generate downloadable URLs for images
    const caravansWithImages = await Promise.all(caravans.map(async (caravan) => {
        if (caravan.imagePath) {
            const imageRef = ref(storage, caravan.imagePath);
            const imageUrl = await getDownloadURL(imageRef);
            return { ...caravan, imageUrl };
        }
        return caravan;
    }));

    return caravansWithImages;
}

// const app = initializeApp(firebaseConfig)
// const db = getFirestore(app)

// // Refactoring the fetching functions below
// const vansCollectionRef = collection(db, "caravans")

// export async function getVans() {
//     const snapshot = await getDocs(vansCollectionRef)
//     const caravans = snapshot.docs.map(doc => ({
//         ...doc.data(),
//         id: doc.id
//     }))
//     return caravans
// }

// export async function getVan(id) {
//     const docRef = doc(db, "caravans", id)
//     const snapshot = await getDoc(docRef)
//     return {
//         ...snapshot.data(),
//         id: snapshot.id
//     }
// }

// export async function getHostVans() {
//     const q = query(vansCollectionRef, where("hostId", "==", "123"))
//     const snapshot = await getDocs(q)
//     const caravans = snapshot.docs.map(doc => ({
//         ...doc.data(),
//         id: doc.id
//     }))
//     return caravans
// }

/* 
This 👇 isn't normally something you'd need to do. Instead, you'd 
set up Firebase security rules so only the currently logged-in user 
could edit their vans.

https://firebase.google.com/docs/rules

I'm just leaving this here for educational purposes, as it took
me a while to find the `documentId()` function that allows you
to use a where() filter on a document's ID property. (Since normally
it only looks at the data() properties of the document, meaning you
can't do `where("id", "==", id))`

It also shows how you can chain together multiple `where` filter calls
*/

export async function getHostVan(id) {
    const q = query(
        vansCollectionRef,
        where(documentId(), "==", id),
        where("hostId", "==", "123")
    )
    const snapshot = await getDocs(q)
    const vans = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    return vans[0]
}

export async function loginUser(creds) {
    const res = await fetch("/api/login",
        { method: "post", body: JSON.stringify(creds) }
    )
    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message,
            statusText: res.statusText,
            status: res.status
        }
    }

    return data
}