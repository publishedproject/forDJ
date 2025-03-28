import React, { useEffect, useRef } from 'react';
import styles from '../styles/AdvancedBackground.module.css';

const AdvancedBackground = () => {
  const canvasRef = useRef(null);
  
  // Set up canvas and grid drawing
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    
    // Resize canvas to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initial size setup
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Clear canvas
    const clear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    // Draw grid
    const drawGrid = () => {
      // Draw thin grid lines
      ctx.strokeStyle = 'rgba(127, 127, 255, 0.2)';
      ctx.lineWidth = 0.5;
      
      // Horizontal lines
      const gridSize = 30;
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw thicker grid lines
      ctx.strokeStyle = 'rgba(127, 127, 255, 0.3)';
      ctx.lineWidth = 1;
      
      // Major horizontal lines
      const majorGridSize = 150;
      for (let y = 0; y < canvas.height; y += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Major vertical lines
      for (let x = 0; x < canvas.width; x += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    };
    
    // Animation loop
    const animate = () => {
      clear();
      drawGrid();
      animationFrame = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <div className={styles.backgroundContainer}>
      {/* Canvas for dynamic grid rendering */}
      <canvas ref={canvasRef} className={styles.gridCanvas}></canvas>
      
      {/* Background glows */}
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>
      <div className={styles.glow3}></div>
    </div>
  );
};

export default AdvancedBackground; 