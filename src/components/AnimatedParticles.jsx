import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedParticles = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Create particles with random properties
    const generateParticles = () => {
      const count = window.innerWidth < 768 ? 15 : 25;
      const newParticles = [];
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100, // Random position (0-100%)
          y: Math.random() * 100,
          size: Math.random() * 80 + 20, // Size between 20-100px
          opacity: Math.random() * 0.5 + 0.1, // Opacity between 0.1-0.6
          duration: Math.random() * 25 + 15, // Animation duration 15-40s
          delay: Math.random() * 5, // Random delay 0-5s
          blurAmount: Math.random() * 3 + 1, // Blur 1-4px
        });
      }
      
      setParticles(newParticles);
    };
    
    generateParticles();
    
    // Regenerate particles when window resizes
    const handleResize = () => {
      generateParticles();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="particles">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="particle"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            filter: `blur(${particle.blurAmount}px)`,
            background: `radial-gradient(circle at 30% 30%, 
              ${Math.random() > 0.5 ? 'var(--bg-accent-1)' : 'var(--bg-accent-2)'}, 
              transparent 70%)`,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -40, -20, -60, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
            opacity: [particle.opacity, particle.opacity * 1.2, particle.opacity * 0.8, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedParticles; 