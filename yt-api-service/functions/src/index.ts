/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

initializeApp()

const firestore = new Firestore()

// event-driven function/architecture - when a user is created, create a user document in the firestore
export const createUser = functions.auth.user().onCreate((user) => {
	const userInfo = {
		uid: user.uid,
		email: user.email,
		photoUrl: user.photoURL,
	}

	// if the collection or doc does not exist it will be created automatically (upsert)
	firestore.collection("users").doc(user.uid).set(userInfo)
	logger.info(`User created: ${JSON.stringify(userInfo)}`)
	return
});
