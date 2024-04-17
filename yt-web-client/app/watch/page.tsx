"use client"
import { useSearchParams } from "next/navigation";

export default function Watch() {
    const videoPrefix = 'https://storage.googleapis.com/blend-yt-processed-videos/';
    const videoSrc = useSearchParams().get("v");
    return (
        <div>
            <h2>Watching {videoSrc}</h2>
            <video controls src={videoPrefix + videoSrc} />
        </div>
    );
}