import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Player from '@vimeo/player';

const VideoBanner = ({
  videoId,
  videoSource,
  logoSrc,
  title,
  onLoaded,
  scrollTargetId,
  onScrollDown,
  aspectRatio,
  overlayColor,
  showScrollDown = true,
}) => {
  const [videoLoading, setVideoLoading] = useState(true);
  const iframeRef = useRef(null);
  const [minHeight, setMinHeight] = useState(window.matchMedia('(max-height: 400px)').matches);
  const [maxAspect, setMaxAspect] = useState(window.matchMedia('(max-aspect-ratio: 16/9)').matches);
  const [minAspect, setMinAspect] = useState(window.matchMedia('(min-aspect-ratio: 16/9)').matches);

  useEffect(() => {
    const handleResize = () => {
      setMinHeight(window.matchMedia('(max-height: 400px)').matches);
      setMaxAspect(window.matchMedia('(max-aspect-ratio: 16/9)').matches);
      setMinAspect(window.matchMedia('(min-aspect-ratio: 16/9)').matches);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let player;
    if (iframeRef.current) {
      if (videoSource === 'vimeo') {
        player = new Player(iframeRef.current);

        player.on('play', () => {
          setVideoLoading(false);
        });

        player.on('loaded', () => {
          if (typeof onLoaded === 'function') {
            onLoaded();
          }
        });
      } else if (videoSource === 'youtube') {
        const onYouTubeIframeAPIReady = () => {
          player = new YT.Player(iframeRef.current, {
            videoId: videoId,
            playerVars: {
              'playsinline': 1,
              'autoplay': 1,
              'mute': 1,
              'controls': 0,
              'showinfo': 0,
              'rel': 0,
              'modestbranding': 1,
            },
            events: {
              'onReady': () => {
                if (typeof onLoaded === 'function') {
                  onLoaded();
                }
              },
              'onStateChange': (event) => {
                if (event.data === YT.PlayerState.PLAYING) {
                  setVideoLoading(false);
                }
              }
            }
          });
        };

        if (typeof YT === 'undefined' && !window.youTubeIframeAPIReady) {
          window.youTubeIframeAPIReady = true;
          const script = document.createElement('script');
          script.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(script);
          window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        } else if (typeof YT !== 'undefined') {
          onYouTubeIframeAPIReady();
        }
      }
    }

    return () => {
      if (videoSource === 'vimeo' && player) {
        player.off('play');
        player.off('loaded');
      } else if (videoSource === 'youtube' && player && player.destroy) {
        player.destroy();
      }
    };
  }, [videoId, videoSource, onLoaded]);

  const handleScrollDown = (e) => {
    e.stopPropagation();
    const target = document.getElementById(scrollTargetId);
    if (typeof onScrollDown === 'function') {
      onScrollDown();
    } else if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const videoUrl = videoSource === 'vimeo'
    ? `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&muted=1`
    : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${videoId}`;

  const aspectRatioMap = {
    '16:9': 9 / 16,
    '9:16': 16 / 9,
    '1:1': 1,
  };

  const aspectRatioValue = aspectRatioMap[aspectRatio];

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    width: '100vw',
    marginTop: '-64px'
  };

  if (aspectRatio === 'full') {
    containerStyles.height = '100vh';
  } else if (aspectRatioValue) {
    containerStyles.height = 0;
    containerStyles.paddingBottom = `${(1 / aspectRatioValue) * 100}%`;
  } else {
    containerStyles.height = '100vh';
  }

  const overlayStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: overlayColor || 'linear-gradient(180deg, rgba(50, 50, 50, 1), rgba(0, 0, 0, 1))',
    opacity: videoLoading ? 1 : 0.3,
    transition: 'opacity 0.5s ease',
    zIndex: 2,
    cursor: 'pointer',
  };

  const textContainerStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: `${minHeight ? '16px' : '24px'}`,
    marginTop: `${minHeight ? '0px' : '16px'}`,
    color: 'white',
    cursor: 'pointer',
  };

  const logoStyles = {
    maxWidth: 350,
    marginBottom: 16,
    width: '100%',
    height: 'auto',
  };

  const titleStyles = {
    color: 'white',
    maxWidth: '85%',
    fontSize: minHeight ? '1.5rem' : '2rem',
    fontWeight: 500,
    lineHeight: 1.2,
  };

  const scrollDownContainerStyles = {
    position: 'absolute',
    bottom: `${minHeight ? '36px' : '20px'}`,
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    color: 'white',
    zIndex: 3,
  };

  const learnMoreStyles = {
    color: 'white',
    fontSize: minHeight ? '0.875rem' : '1rem',
    marginBottom: '4px',
    opacity: 0.9,
  };

  const expandMoreButtonStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease',
  };

  const expandMoreIconStyles = {
    width: '24px',
    height: '24px',
    fill: 'white',
    transition: 'transform 0.2s ease',
    animation: 'autoBounce 5s ease-in-out infinite',
  };

  const bounceAnimation = `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(8px);
      }
    }
  `;

  const autoBounceAnimation = `
    @keyframes autoBounce {
      0%, 40%, 100% {
        transform: translateY(0);
        opacity: 0.8;
      }
      20% {
        transform: translateY(8px);
        opacity: 1;
      }
    }
  `;

  return (
    <div style={containerStyles}>
      <style>{bounceAnimation}</style>
      <style>{autoBounceAnimation}</style>
      <iframe
        title="video-banner"
        src={videoUrl}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        ref={iframeRef}
        style={{
          position: 'absolute',
          zIndex: 1,
          top: '50%',
          left: '50%',
          height: minAspect ? '56.25vw' : '100vh',
          width: maxAspect ? '177.78vh' : '100vw',
          cursor: 'pointer',
          transform: 'translate(-50%, -50%)',
        }}
      ></iframe>
      <div
        style={overlayStyles}
        onClick={handleScrollDown}
      />
      <div
        style={textContainerStyles}
        onClick={handleScrollDown}
      >
        {logoSrc && (
          <img
            alt="Logo"
            src={logoSrc}
            style={logoStyles}
          />
        )}
        {title && (
          <h3 style={titleStyles}>
            {title}
          </h3>
        )}
      </div>
      {showScrollDown && (
        <div
          style={scrollDownContainerStyles}
          onMouseEnter={(e) => {
            const button = e.currentTarget.querySelector('button');
            if (button) {
              button.style.animation = 'bounce 1s infinite';
            }
          }}
          onMouseLeave={(e) => {
            const button = e.currentTarget.querySelector('button');
            if (button) {
              button.style.animation = 'autoBounce 5s ease-in-out infinite';
            }
          }}
        >
          <p style={learnMoreStyles}>
            Learn More
          </p>
          <button
            onClick={handleScrollDown}
            style={{
              ...expandMoreButtonStyles,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <svg style={expandMoreIconStyles} viewBox="0 0 24 24">
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
              <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

VideoBanner.propTypes = {
  videoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  videoSource: PropTypes.oneOf(['vimeo', 'youtube']).isRequired,
  logoSrc: PropTypes.string,
  title: PropTypes.string,
  onLoaded: PropTypes.func,
  scrollTargetId: PropTypes.string,
  onScrollDown: PropTypes.func,
  aspectRatio: PropTypes.oneOf(['16:9', '9:16', '1:1', 'full']),
  overlayColor: PropTypes.string,
  showScrollDown: PropTypes.bool,
};

VideoBanner.defaultProps = {
  videoSource: 'vimeo',
  logoSrc: null,
  title: '',
  onLoaded: null,
  scrollTargetId: null,
  onScrollDown: null,
  aspectRatio: 'full',
  overlayColor: 'black',
  showScrollDown: true,
};

export default VideoBanner;