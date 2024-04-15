import Image from 'next/image';
import Link from 'next/link';
import { getVideos } from './firebase/functions';
import styles from './page.module.css'


export default async function Home() {
  const videos = await getVideos();
  const thumbnailPrefix = 'https://storage.googleapis.com/thumbnails-blend-yt-processed-videos/';

  return (
    <main>
      {
        videos.map((video) => (
          <Link href={`/watch?v=${video.filename}`} key={video.id}>
            <Image src={thumbnailPrefix + video.thumbnail} alt='video' width={120} height={80}
              className={styles.thumbnail}/>
          </Link>
        ))
      }
    </main>
  )
}

/* 
This will re-render this page once every 30 seconds and then it's going to cache the page and then send that cached copy to the users. 
This reduces the load on getVideos function. We are doing this because when a new video is uploaded, we want to show it to the users as soon as possible. 
By default, since the videos const will already be populated, the page will be served from the cache and the getVideos function will not be called, unless the page is refreshed manually. 
This is why we need to revalidate the page every 30 seconds.
*/
export const revalidate = 30;