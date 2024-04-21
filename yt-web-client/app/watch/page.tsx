"use client"
import React, { Suspense } from 'react';
import { useSearchParams } from "next/navigation";

function Video() {
    const videoPrefix = 'https://storage.googleapis.com/blend-yt-processed-videos/';
    const videoSrc = useSearchParams().get("v");
    return (
        <div>
            <h2>Watching {videoSrc}</h2>
            <video controls src={videoPrefix + videoSrc} />
        </div>
    );
}

export default function Watch() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
           <Video />
        </Suspense>
    );
}