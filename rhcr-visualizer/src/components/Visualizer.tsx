import React, { useEffect, useRef } from 'react';
import { f_Frog, type StepData } from '../utils/rhcr2';

interface VisualizerProps {
  stepData: StepData | null;
}

export const Visualizer: React.FC<VisualizerProps> = ({ stepData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Constants
  const DOMAIN_MIN = -512;
  const DOMAIN_MAX = 512;
  const DOMAIN_RANGE = DOMAIN_MAX - DOMAIN_MIN;

  // Render the background heatmap once
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Create an offscreen canvas for the background to avoid re-rendering f_Frog
    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement('canvas');
      bgCanvasRef.current.width = canvas.width;
      bgCanvasRef.current.height = canvas.height;
      
      const ctx = bgCanvasRef.current.getContext('2d');
      if (ctx) {
        // Render a low-res heat map to save performance
        const resolution = 4; // px per block
        for (let px = 0; px < canvas.width; px += resolution) {
          for (let py = 0; py < canvas.height; py += resolution) {
            // Map pixel to domain
            const x = DOMAIN_MIN + (px / canvas.width) * DOMAIN_RANGE;
            const y = DOMAIN_MIN + ((canvas.height - py) / canvas.height) * DOMAIN_RANGE; // Invert Y
            
            const val = f_Frog(x, y);
            
            // Map value to color based on typical f_Frog range (-1000 to 1000 approximately)
            // Normalized value 0-1
            const normalized = Math.max(0, Math.min(1, (val + 1000) / 2000));
            
            // Create a gradient from lowest to highest
            const hue = 240 - (normalized * 240); // Blue to Red
            ctx.fillStyle = `hsl(${hue}, 70%, 20%)`; // Darker, rich colors
            ctx.fillRect(px, py, resolution, resolution);
          }
        }
      }
    }
  }, []);

  // Render updates
  useEffect(() => {
    if (!canvasRef.current || !bgCanvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to map domain coordinates to screen pixels
    const toScreen = (x: number, y: number) => {
      const px = ((x - DOMAIN_MIN) / DOMAIN_RANGE) * canvas.width;
      const py = canvas.height - (((y - DOMAIN_MIN) / DOMAIN_RANGE) * canvas.height);
      return { px, py };
    };

    // Clear and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgCanvasRef.current, 0, 0);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    if (!stepData) return;

    // Draw Neighbors
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (const neighbor of stepData.neighbors) {
      const { px, py } = toScreen(neighbor.x, neighbor.y);
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw best neighbor if found
    if (stepData.bestNeighbor) {
      const best = toScreen(stepData.bestNeighbor.x, stepData.bestNeighbor.y);
      
      // Line to best neighbor
      const current = toScreen(stepData.currentPoint.x, stepData.currentPoint.y);
      ctx.strokeStyle = '#5EEAD4'; // Accent color
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); // Dashed line for intent
      ctx.beginPath();
      ctx.moveTo(current.px, current.py);
      ctx.lineTo(best.px, best.py);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Best neighbor dot
      ctx.fillStyle = '#C7D2FE'; 
      ctx.beginPath();
      ctx.arc(best.px, best.py, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw Current Point
    const current = toScreen(stepData.currentPoint.x, stepData.currentPoint.y);
    ctx.fillStyle = '#5EEAD4'; // Accent color
    ctx.shadowColor = '#5EEAD4';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(current.px, current.py, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset

    // Draw Coordinates label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Inter';
    ctx.fillText(`(${stepData.currentPoint.x.toFixed(1)}, ${stepData.currentPoint.y.toFixed(1)})`, current.px + 10, current.py - 10);

  }, [stepData]);

  // Handle resize matching
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
          // Force background regeneration on resize
          bgCanvasRef.current = null;
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="canvas-wrapper glass-panel">
      <div className="visualizer-header">
        <h2>f_Frog Topology</h2>
        <p>Domain: [-512, 512] for X and Y</p>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};
