import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

// we will download from this bucker
const rawVideoBucketName = 'blend-yt-raw-videos';
// we will upload to this bucket
const processedVideoBucketName = 'blend-yt-processed-videos';

const localRawVideoPath = './raw-videos';
const localProcessedVideoPath = './processed-videos';

const localThumbnailDirectory = './thumbnails-blend-yt-processed-videos';
const thumbnailBucketName = 'thumbnails-blend-yt-processed-videos';

// Creates the local directories for raw and processed videos
export function setupDirectories() {
    ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);
    ensureDirectoryExists(localThumbnailDirectory);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video is converted
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        // Process the video
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        // Resize the video to 360p
            // .outputOptions(['-vf', 'scale=-1:360']) //this does not work for me so I used the below
            .outputOptions('-vf', 'scale=640:360')
            .on('end', () => {
                console.log('Video processing finished successfully')
                resolve()
            })
            .on('error', (err) => {
                console.log('Error processing video:', err)
                reject(err)
            })
            .save(`${localProcessedVideoPath}/${processedVideoName}`)
    });
}

/**
 * 
 * @param filename - The name of the file to download from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} directory
 * @returns A promise that resolves when the video is downloaded
 */
export async function downloadVideoFromBucket(filename: string) {
    await storage.bucket(rawVideoBucketName).file(filename).download({ destination: `${localRawVideoPath}/${filename}` });
    console.log(`gs://${rawVideoBucketName}/${filename} downloaded to ${localRawVideoPath}/${filename}`);
}

/**
 * 
 * @param filename - The name of the file to upload from the
 * {@link localProcessedVideoPath} directory into the {@link processedVideoBucketName} bucket
 * @returns A promise that resolves when the video is uploaded 
 */
export async function uploadVideoToBucket(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName,
    });
    console.log(`${fileName} uploaded to ${processedVideoBucketName}`);
    await bucket.file(fileName).makePublic();
    console.log(`${fileName} is now public`);
}

/**
 * Deletes the raw video file with the specified filename.
 * 
 * @param filename - The name of the raw video file to delete.
 * @returns A Promise that resolves when the file is successfully deleted.
 */
export function deleteRawVideo(filename: string) {
    return deleteFile(`${localRawVideoPath}/${filename}`);
}

/**
 * Deletes a processed video file.
 * 
 * @param filename - The name of the video file to delete.
 * @returns A promise that resolves when the file is successfully deleted.
 */
export function deleteProcessedVideo(filename: string) {
    return deleteFile(`${localProcessedVideoPath}/${filename}`);
}

/**
 * Deletes a file at the specified file path.
 * If the file does not exist, it skips the deletion.
 * @param filePath - The path of the file to be deleted.
 * @returns A promise that resolves when the file is deleted or skipped.
 */
function deleteFile(filePath: string): Promise<void> {
   return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file at ${filePath}: ${err}`);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            }
            );
        } else {
            console.log(`File not found at ${filePath}, skipping deletion`);
            resolve();
        }
    });
}

/**
 * Ensures that the specified directory exists.
 * If the directory does not exist, it will be created.
 * @param dirPath - The path of the directory to ensure.
 */
function ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // recursive: true creates enables creating nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}

export async function generateThumbnail(processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        const thumbnailFilename = `thumbnail-${processedVideoName.split('.')[0]}.jpg`;
        const thumbnailPath = `${localThumbnailDirectory}/${thumbnailFilename}`;
        const videoPath = `${localProcessedVideoPath}/${processedVideoName}`;
        const ffmpegProcess = ffmpeg(videoPath)
            .on('end', async () => {
                console.log('Thumbnail extraction complete');
                await uploadThumbnailToBucket(thumbnailPath, thumbnailFilename);
                resolve();
            })
            .on('error', (err) => {
                console.error(`Thumbnail extraction failed: ${err}`);
                reject(err);
            })
            .screenshots({
                count: 1,
                filename: thumbnailFilename,
                folder: localThumbnailDirectory,
            });
    });
}

export async function uploadThumbnailToBucket(thumbnailPath: string, fileName: string) {
    console.log(`Uploading thumbnail ${fileName} from local directory ${thumbnailPath} to bucket: ${thumbnailBucketName}`)
    const bucket = storage.bucket(thumbnailBucketName);
    await bucket.upload(thumbnailPath, {
        destination: fileName,
    });
    console.log(`Thumbnail ${fileName} uploaded to ${thumbnailBucketName}`);
    await bucket.file(fileName).makePublic();
    console.log(`Thumbnail ${fileName} is now public`);
}

export function deleteThumbnail(processedVideoName: string) {
     const thumbnailFilename = `thumbnail-${processedVideoName.split('.')[0]}.jpg`;
    return deleteFile(`${localThumbnailDirectory}/${thumbnailFilename}`);
}