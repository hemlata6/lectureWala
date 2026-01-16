import React from 'react';

const YouTubePlayer = ({ videoUrl }) => {

  if (!videoUrl) return null;

  let videoId = '';

  // Handle youtu.be links
  if (videoUrl.includes('youtu.be')) {
    videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
  }

  // Handle youtube.com/watch?v= links
  if (videoUrl.includes('youtube.com')) {
    const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
    videoId = urlParams.get('v');
  }

  if (!videoId) return <p>Invalid YouTube URL</p>;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;

  return (
    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: '0',
        }}
      />
    </div>
  );
};

export default YouTubePlayer;
