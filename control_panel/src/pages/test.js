// import Hls from 'hls.js';
// import { useEffect, useRef } from 'react';
// import 'video.js/dist/video-js.min.css'; // Import Video.js base CSS
// import 'video.js/dist/video-js.css';


// const test = () => {
//     const src = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8 '
//   const videoRef = useRef(null);

//   useEffect(() => {
//     if (Hls.isSupported()) {
//       const hls = new Hls();
//       hls.loadSource(src);
//       hls.attachMedia(videoRef.current);
//       hls.on(Hls.Events.MANIFEST_PARSED, function() {
//         videoRef.current.play();
//       });
//     } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
//       videoRef.current.src = src;
//       videoRef.current.addEventListener('loadedmetadata', function() {
//         videoRef.current.play();
//       });
//     }
//   }, [src]);

//   return <video className="video-js vjs-matrix vjs-volume-level" style={{ width: '100%', height: '420px' }}  ref={videoRef} controls data-setup='{"fluid": true}' />;
// };

// export default test;


import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const test = () => {
const src = 'https://live-par-1-abr-cdn.livepush.io/live/bigbuckbunnyclip/index.m3u8'
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Ensure that the video player does not already exist
    if (!playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        fluid: true,
        sources: [{
          src: src,
          type: 'application/x-mpegURL'
        }]
      });
    }

    // Dispose the player on component unmount
    // return () => {
    //   if (playerRef.current) {
    //     playerRef.current.dispose();
    //     playerRef.current = null;
    //   }
    // };
  }, [src]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-theme-forest" style={{ width: '100%', height: '420px' }} controls ></video>
    </div>
  );
};

export default test;

