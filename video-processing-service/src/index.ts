import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express()
app.use(express.json())

app.post('/process-video', (req, res) => {
    // Get path of the input video file from the request body
    const inputFilePath = req.body.inputFilePath
    const outputFilePath = req.body.outputFilePath

    if (!inputFilePath || !outputFilePath) {
        res.status(400).send('Bad request. Missing input or output file path')
    }

    // Process the video
    ffmpeg(inputFilePath)
    // Resize the video to 360p
        // .outputOptions(['-vf', 'scale=-1:360']) //this does not work for me so I used the below
        .outputOptions('-vf', 'scale=640:360')
        .on('end', () => {
            console.log('Video processing finished')
            res.status(200).send('Video processing finished successfully')
        })
        .on('error', (err) => {
            console.log('Error processing video:', err)
            res.status(500).send('Error processing video')
        })
        .save(outputFilePath)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Video processing service listening at http://localhost:${port}`)
})