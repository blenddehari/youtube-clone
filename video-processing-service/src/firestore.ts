import { credential } from "firebase-admin";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();

// Note: This requires setting an env variable in Cloud Run
/** if (process.env.NODE_ENV !== 'production') {
  firestore.settings({
      host: "localhost:8080", // Default port for Firestore emulator
      ssl: false
  });
} */


const videoCollectionId = 'videos';
const thumbnailCollectionId = 'thumbnails';

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

async function getVideo(videoId: string) {
  const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
  return (snapshot.data() as Video) ?? {};
}

export function setVideo(videoId: string, video: Video) {
  return firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .set(video, { merge: true })
}

export async function isVideoNew(videoId: string) {
  const video = await getVideo(videoId);
  return video?.status === undefined;
}

// TODO: Implement the DELETE operation
// export async function deleteVideo(videoId: string) {
//   await firestore.collection(videoCollectionId).doc(videoId).delete();
// }

// TODO: check these implementations
export async function getThumbnail(videoId: string) {
  const snapshot = await firestore.collection(thumbnailCollectionId).doc(videoId).get();
  return (snapshot.data() as Video) ?? {};
}

export function setThumbnail(videoId: string, thumbnail: Video) {
  return firestore
    .collection(thumbnailCollectionId)
    .doc(videoId)
    .set(thumbnail, { merge: true })
}
