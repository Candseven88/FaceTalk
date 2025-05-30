'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();
  
  const init = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full width/height
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };
    
    // Create particles
    const createParticles = () => {
      particles.current = [];
      const particleCount = Math.floor(window.innerWidth / 15); // Adjust density
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 2 + 0.1; // Random size
        
        // Create particle with random properties
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: getRandomColor(),
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    };
    
    // Get random blue-ish color
    const getRandomColor = () => {
      const hue = Math.floor(Math.random() * 60) + 200; // Blue to purple range
      const saturation = Math.floor(Math.random() * 40) + 60;
      const lightness = Math.floor(Math.random() * 20) + 70;
      return `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`;
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.current.forEach((particle) => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x > canvas.width || particle.x < 0) {
          particle.speedX = -particle.speedX;
        }
        
        if (particle.y > canvas.height || particle.y < 0) {
          particle.speedY = -particle.speedY;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        
        // Connect particles within a certain distance
        connectParticles(particle);
      });
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Connect nearby particles with lines
    const connectParticles = (p1: Particle) => {
      particles.current.forEach((p2) => {
        const distance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );
        const maxDistance = 100; // Max distance for connection
        
        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.strokeStyle = p1.color;
          ctx.globalAlpha = 0.1 * (1 - distance / maxDistance); // Fade with distance
          ctx.lineWidth = 0.5;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    };
    
    // Initialize
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  };
  
  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ opacity: 0.3 }}
    />
  );
} 