import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const LiveVideoPlayer = ({src}) => {
// const src = 'https://live-par-1-abr-cdn.livepush.io/live/bigbuckbunnyclip/index.m3u8'
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

export default LiveVideoPlayer;