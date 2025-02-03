// Templates.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Add this import
import './Templates.css';

const videoTemplates = [
  {
    id: 'template1',
    name: 'Minecraft Parkour',
    description: 'Perfect for gaming content and tutorials',
    videoSrc: '/video/template1.mp4',
    duration: '1:30',
    category: 'Gaming'
  },
  {
    id: 'template2',
    name: 'Subway Surfers',
    description: 'Trending background for storytelling',
    videoSrc: '/video/template2.mp4',
    duration: '2:00',
    category: 'Gaming'
  },
  {
    id: 'template3',
    name: 'Car Stunts',
    description: 'High-energy background for viral content',
    videoSrc: '/video/template3.mp4',
    duration: '1:45',
    category: 'Action'
  }
];

const TemplateCard = ({ template }) => {
  const navigate = useNavigate();  // Add this hook
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = React.useRef(null);

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

  const handleUseTemplate = () => {
    navigate(`/create?template=${template.id}`);
  };

  return (
    <div 
      className="template-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="template-video-container">
        <video 
          ref={videoRef}
          src={template.videoSrc}
          muted 
          loop 
          playsInline
          className="template-video"
        />
        <div className={`template-overlay ${isHovered ? 'hidden' : ''}`}>
          <span>Hover to preview</span>
        </div>
        <div className="template-details">
          <span className="template-category">{template.category}</span>
          <span className="template-duration">{template.duration}</span>
        </div>
      </div>

      <div className="template-info">
        <div className="template-header">
          <h3>{template.name}</h3>
          <p>{template.description}</p>
        </div>
        <button 
          onClick={handleUseTemplate}
          className="btn-use-template"
        >
          Use Template
        </button>
      </div>
    </div>
  );
};

const Templates = () => {
  return (
    <section id="templates" className="templates">
      <div className="container">
        <div className="templates-header">
          <h2>Video Templates</h2>
          <p>Choose from our trending collection of background videos</p>
        </div>

        <div className="templates-grid">
          {videoTemplates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Templates;