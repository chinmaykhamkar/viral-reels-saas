// Hero.jsx
import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <h1>Transform Your Content Into <span>Viral Videos</span> Instantly</h1>
          <p>Turn your scripts or Reddit posts into engaging videos with trending templates. Create viral-worthy content in minutes, not hours.</p>
          
          <div className="hero-buttons">
            <button className="btn btn-primary">Get Started Free</button>
            <button className="btn btn-outline">Watch Demo</button>
          </div>

          <div className="hero-features">
            <div className="hero-feature">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>No Credit Card Required</span>
            </div>
            <div className="hero-feature">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>5 Free Generations</span>
            </div>
          </div>
        </div>

        <div className="hero-generator">
          <div className="generator-header">
            <h3>Quick Video Generator</h3>
            <div className="window-controls">
              <span className="control red"></span>
              <span className="control yellow"></span>
              <span className="control green"></span>
            </div>
          </div>
          
          <textarea 
            placeholder="Paste your script or Reddit post link here..."
          ></textarea>
          
          <div className="generator-buttons">
            <button className="btn btn-primary">Select Template</button>
            <button className="btn btn-success">Generate Video</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;