# youtube-clone
 
Video-processing-service:
Build, push and deploy docker image for video-processing-service:

BUILD:
docker buildx build --platform linux/amd64 -t us-central1-docker.pkg.dev/blend-yt-clone/video-processing-repo/video-processing-service .

PUSH:
docker push us-central1-docker.pkg.dev/blend-yt-clone/video-processing-repo/video-processing-service

DEPLOY:
gcloud run deploy video-processing-service --image us-central1-docker.pkg.dev/blend-yt-clone/video-processing-repo/video-processing-service \
  --region=us-central1 \
  --platform managed \
  --timeout=3600 \
  --memory=2Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=1 \
  --ingress=internal


FUNCTIONS:
- Deploy a specific function: firebase deploy --only functions:getVideos
- Deploy all functions: run the npm script deploy (nmp run deploy) in yt-api-service/functions


WEB Client:
BUILD:
docker buildx build --platform linux/amd64 -t europe-west3-docker.pkg.dev/blend-yt-clone/yt-web-client-repo/yt-web-client  .

PUSH:
docker push europe-west3-docker.pkg.dev/blend-yt-clone/yt-web-client-repo/yt-web-client

DEPLOY:
gcloud run deploy yt-web-client --image europe-west3-docker.pkg.dev/blend-yt-clone/yt-web-client-repo/yt-web-client \
  --region=europe-west3 \
  --platform managed \
  --timeout=3600 \
  --memory=2Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=1



