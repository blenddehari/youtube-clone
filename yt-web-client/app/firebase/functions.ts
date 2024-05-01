import { getFunctions, httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrl = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");

// TODO: how to streamline the types among all services
export enum VideoStatus {
    PROCESSING = "processing",
    PROCESSED = "processed",
}
export interface Video {
    id: string;
    uid: string;
    filename: string;
    status: VideoStatus;
    title: string;
    description: string;
    thumbnail?: string;
}

export async function uploadVideo(file: File) {
   const response: any = await generateUploadUrl({ fieExtension: file.name.split('.').pop(), filename: file.name});

    // Upload the file via the signed URL
    const uploadResult = await fetch(response?.data?.url, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type,
        },
    })

    return uploadResult
}

export async function getVideos() {
   const response = await getVideosFunction();
   return response.data as Video[];
}