// Pricing.jsx
import React from 'react';
import './Pricing.css';

const pricingPlans = [
  {
    name: 'Starter',
    price: '9',
    features: [
      '20 Video Generations',
      'Basic Templates',
      '720p Export Quality'
    ],
    isPopular: false
  },
  {
    name: 'Pro',
    price: '29',
    features: [
      '100 Video Generations',
      'All Templates',
      '1080p Export Quality',
      'Priority Support'
    ],
    isPopular: true
  },
  {
    name: 'Enterprise',
    price: '99',
    features: [
      'Unlimited Generations',
      'Custom Templates',
      '4K Export Quality',
      '24/7 Support'
    ],
    isPopular: false
  }
];

const CheckIcon = () => (
  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
  </svg>
);

const Pricing = () => {
  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <div className="pricing-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose the perfect plan for your content creation needs</p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}
            >
              {plan.isPopular && (
                <div className="popular-badge">MOST POPULAR</div>
              )}
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{plan.price}</span>
                <span className="period">/month</span>
              </div>
              <ul className="features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary">
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;