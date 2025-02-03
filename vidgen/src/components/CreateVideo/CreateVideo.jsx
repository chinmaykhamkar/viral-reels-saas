// CreateVideo.jsx - Updated with API logic
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './CreateVideo.css';

const templates = {
  'template1': {
    videoSrc: '/video/template1.mp4',
    name: 'Minecraft Parkour'
  },
  'template2': {
    videoSrc: '/video/template2.mp4',
    name: 'Subway Surfers'
  },
  'template3': {
    videoSrc: '/video/template3.mp4',
    name: 'Car Stunts'
  }
};

const CreateVideo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [outputVideoUrl, setOutputVideoUrl] = useState('');
  const videoRef = useRef(null);
  const outputVideoRef = useRef(null);
  const templateId = searchParams.get('template');

  useEffect(() => {
    if (!templateId || !templates[templateId]) {
      navigate('/');
      return;
    }

    if (videoRef.current) {
      videoRef.current.src = templates[templateId].videoSrc;
    }
  }, [templateId, navigate]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play().catch(console.error);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOutputVideoUrl('');

    const formData = new FormData(e.target);
    const text = formData.get('contentInput');
    const isRedditPost = formData.get('isRedditPost') === 'on';

    try {
      // Make API call to process video
      const response = await fetch('http://localhost:3000/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: templateId,
          text: text,
          isRedditPost: isRedditPost
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Set video URL
        setOutputVideoUrl(`http://localhost:3000/video/${templateId}`);
        
        // Show output section
        setShowOutput(true);

        // Scroll to output video
        outputVideoRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error(data.error || 'Failed to generate video');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error generating video: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!templateId || !templates[templateId]) {
    return null;
  }

  return (
    <div className="create-video">
      <nav className="navbar">
        <div className="container">
          <a href="/" className="logo">VidGen</a>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <div className="content-grid">
            {/* Template Preview */}
            <div className="preview-section">
              <h2>Selected Template</h2>
              <div className="template-preview"
                   onMouseEnter={handleMouseEnter}
                   onMouseLeave={handleMouseLeave}>
                <div className="video-container">
                  <video
                    ref={videoRef}
                    muted
                    loop
                    preload="metadata"
                  />
                  <div className={`preview-overlay ${isHovered ? 'hidden' : ''}`}>
                    <span>Hover to preview</span>
                  </div>
                </div>
                <div className="template-info">
                  <h3>{templates[templateId].name}</h3>
                </div>
              </div>
            </div>

            {/* Content Input */}
            <div className="input-section">
              <h2>Generate Video</h2>
              <form onSubmit={handleSubmit} className="input-form">
                <div className="form-header">
                  <h3>Enter Your Content</h3>
                  <div className="window-controls">
                    <span className="control red"></span>
                    <span className="control yellow"></span>
                    <span className="control green"></span>
                  </div>
                </div>

                <textarea
                  name="contentInput"
                  placeholder="Paste your script or Reddit post link here..."
                  required
                />

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    name="isRedditPost"
                    id="isRedditPost"
                  />
                  <label htmlFor="isRedditPost">
                    This is a Reddit post URL
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-button"
                >
                  {isLoading ? 'Generating Video...' : 'Generate Video'}
                </button>

                {error && (
                  <div className="error-message mt-4 text-red-500">
                    {error}
                  </div>
                )}

                {(isLoading || outputVideoUrl) && (
                  <div className="output-section">
                    <div className="output-header">
                      <h3>Generated Video</h3>
                    </div>
                    
                    {isLoading ? (
                      <div className="loading-indicator">
                        <div className="spinner"></div>
                        <span>Generating your video...</span>
                      </div>
                    ) : outputVideoUrl && (
                      <div className="video-output">
                        <video
                          ref={outputVideoRef}
                          controls
                          src={outputVideoUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateVideo;