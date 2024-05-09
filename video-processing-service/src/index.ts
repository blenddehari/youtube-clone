import express from 'express';
import { convertVideo, deleteProcessedVideo, deleteRawVideo, deleteThumbnail, downloadVideoFromBucket, setupDirectories, uploadThumbnailToBucket, uploadVideoToBucket, generateThumbnail, checkVideoExists } from './storage'; 
import { VideoStatus, isVideoNew, setVideo } from './firestore';

setupDirectories();

const app = express();
app.use(express.json());

// this endpoint will be invoked by the cloud pub/sub message, not a user
app.post('/process-video', async (req, res) => {
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
        const data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received');
        }

        const inputFilename = data.name; // e.g. video123-raw.mp4 (FORMAT: <UUID>-<DATE>.EXTENSION)
        const outputFilename = `processed-${inputFilename}`;
        const videoId = inputFilename.split('-')[0];

        if (!isVideoNew(videoId)) {
            console.log('Video has already been processed');
            return res.status(400).send('Bad request: Video has already been processed');
        }

        console.log('Processing video:', inputFilename);
        setVideo(videoId, {
            id: videoId,
            uid: videoId.split('-')[0],
            status: VideoStatus.PROCESSING
        });

        const videoFound = await checkVideoExists(inputFilename);
        if (!videoFound) {
            console.error('Video not found');
            return res.status(404).send('Video not found: ' + inputFilename);
        }

        await downloadVideoFromBucket(inputFilename);
        await convertVideo(inputFilename, outputFilename);
        await uploadVideoToBucket(outputFilename);
        await generateThumbnail(outputFilename);

        await setVideo(videoId, {
            status: VideoStatus.PROCESSED,
            filename: outputFilename,
            thumbnail: `thumbnail-${outputFilename.replace(/\.[^.]+$/, '.jpg')}`
        });

        await Promise.all([
            deleteRawVideo(inputFilename),
            deleteProcessedVideo(outputFilename),
            deleteThumbnail(outputFilename)
        ]);

        console.log('Video processing complete');
        res.status(200).send('Video processing complete');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing video');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Video processing service listening at http://localhost:${port}`);
});
