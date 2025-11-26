import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial size
    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;
    
    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
       // Wrap in requestAnimationFrame to prevent "ResizeObserver loop completed with undelivered notifications" error
       window.requestAnimationFrame(() => {
         if (canvas) {
            width = canvas.width = canvas.clientWidth;
            height = canvas.height = canvas.clientHeight;
         }
       });
    });
    resizeObserver.observe(canvas);

    const bars = 40;
    
    const draw = (time: number) => {
      // Clear with current dimensions
      ctx.clearRect(0, 0, width, height);
      
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#059669'); // brand-600
      gradient.addColorStop(1, '#34d399'); // brand-400
      ctx.fillStyle = gradient;

      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        let barHeight = 4;
        
        if (isPlaying) {
            // Simulate frequency data since we might not have the AudioContext analyzer attached to the blob url easily 
            // without CORS/SourceNode setup complexity. For UI feedback this is sufficient.
            const noise = Math.sin(time * 0.005 + i * 0.2) * 0.5 + 0.5;
            barHeight = Math.max(4, noise * height * 0.8);
        } else {
             barHeight = 4;
        }

        // Center visualizer
        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        
        // Rounded bars
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 4);
        } else {
            ctx.rect(x + 1, y, barWidth - 2, barHeight);
        }
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [isPlaying]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default Visualizer;