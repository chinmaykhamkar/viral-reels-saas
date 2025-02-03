// src/components/Home/Home.jsx
import React from 'react';
import Header from '../Header/Header';
import Hero from '../Hero/Hero';
import Features from '../Features/Features';
import HowItWorks from '../HowItWorks/HowItWorks';
import Templates from '../Template/Templates';
import Pricing from '../Pricing/Pricing';
import Footer from '../Footer/Footer';

const Home = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Templates />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Home;