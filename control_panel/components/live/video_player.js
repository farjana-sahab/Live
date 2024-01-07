import Hls from 'hls.js';
import { useEffect, useRef } from 'react';
import 'video.js/dist/video-js.min.css'; // Import Video.js base CSS


const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        videoRef.current.play();
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', function() {
        videoRef.current.play();
      });
    }
  }, [src]);

  return <video className="video-js vjs-theme-forest" style={{ width: '100%', height: '420px' }}  ref={videoRef} controls  data-setup='{"fluid": true}'  />;
};

export default VideoPlayer;