import express from 'express';
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadVideoFromBucket, setupDirectories, uploadVideoToBucket } from './storage'; 
import { VideoStatus, isVideoNew, setVideo } from './firestore';

setupDirectories();

const app = express()
app.use(express.json())

// this endpoint will be invoked by the cloud pub/sub message, not a user
app.post('/process-video', async (req, res) => {
    //    Get the bucket and filename from the Cloud Pub/Sub message
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received');
        }
    } catch (err) {
        console.error(err);
        return res.status(400).send('Bad request: missing filename');
    }

    const inputFilename = data.name; // e.g. video123-raw.mp4 (FORMAT: <UUID>-<DATE>.EXTENSION)
    const outputFilename = `processed-${inputFilename}`;
    const videoId = inputFilename.split('-')[0];

    if (!isVideoNew(videoId)) {
        console.log('Video has already been processed');
        return res.status(400).send('Bad request: Video has already been processed');
    } else {
        console.log('Processing video:', inputFilename);
        setVideo(videoId, {
            id: videoId,
            uid: videoId.split('-')[0],
            status: VideoStatus.PROCESSING
        });
    }

    //Download the raw video from the Cloud Storage
    await downloadVideoFromBucket(inputFilename);

    //Process the video (resize it to 360p)
    try {
        await convertVideo(inputFilename, outputFilename);
    } catch (err) {
       await Promise.all([
            deleteRawVideo(inputFilename),
            deleteProcessedVideo(outputFilename)
        ]);
        console.error(err);
        return res.status(500).send('Error processing video');
    }

    //  Upload the processed video to the Cloud Storage
    await uploadVideoToBucket(outputFilename);

    //  Update the Firestore document to reflect the video has been processed
    await setVideo(videoId, {
        status: VideoStatus.PROCESSED,
        filename: outputFilename
    });

    //  Delete the raw and processed videos from the local filesystem
    await Promise.all([
        deleteRawVideo(inputFilename),
        deleteProcessedVideo(outputFilename)
    ]);

    console.log('Video processing complete');
    res.status(200).send('Video processing complete');
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Video processing service listening at http://localhost:${port}`)
})