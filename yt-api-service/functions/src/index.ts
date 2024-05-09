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
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

initializeApp()

const firestore = new Firestore()
const storage = new Storage()

const rawVideoBucketName = 'blend-yt-raw-videos';

const videoCollectionId = 'videos';

export enum VideoStatus {
	PROCESSING = 'processing',
	PROCESSED = 'processed'
}

export interface Video {
	id?: string,
	uid?: string,
	filename?: string,
	status?: VideoStatus,
	title?: string,
	description?: string,
	thumbnail?: string,
}

// event-driven functions/architecture - when a user is created, create a user document in the firestore
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

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
	// Check if the user is authenticated
	if (!request.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}

	const auth = request.auth
	const data = request.data
	const bucket = storage.bucket(rawVideoBucketName)

	// Generate a unique filename
	const fileName = `${auth.uid}-${Date.now()}-${data.filename}.${data.fileExtension}`

	// Get a v4 signed URL for uploading the video
	const [url] = await bucket.file(data.filename).getSignedUrl({
		version: 'v4',
		action: 'write',
		expires: Date.now() + 15 * 60 * 1000, // 15 minutes
	})

	return {url, fileName}
})

export const getVideos = onCall({maxInstances: 1}, async () => {
	// TODO: this is a naive implementation, we should paginate the results
	const snapshot = await firestore.collection(videoCollectionId).limit(100).get()
	return snapshot.docs.map((doc) => doc.data())
})