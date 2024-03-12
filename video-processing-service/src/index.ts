import express from 'express';
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadVideoFromBucket, setupDirectories, uploadVideoToBucket } from './storage';

setupDirectories();

const app = express()
app.use(express.json())

// this endpoint will be invoked by the cloud pub/sub message, not a user
app.post('/process-video', async (req, res) => {
    //    Get the bucket and filename from the Clound Pub/Sub message
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

    const inputFilename = data.name;
    const outputFilename = `processed-${inputFilename}`;

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