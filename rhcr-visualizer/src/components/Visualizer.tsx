import React, { useEffect, useRef, useCallback } from 'react';
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

  const generateBackground = useCallback((canvas: HTMLCanvasElement) => {
    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement('canvas');
      bgCanvasRef.current.width = canvas.width;
      bgCanvasRef.current.height = canvas.height;
      
      const ctx = bgCanvasRef.current.getContext('2d', { alpha: false });
      if (ctx) {
        // Render a low-res heat map to save performance
        const resolution = 6; // px per block (increased to save computation)
        for (let px = 0; px < canvas.width; px += resolution) {
          for (let py = 0; py < canvas.height; py += resolution) {
            // Map pixel to domain
            const x = DOMAIN_MIN + (px / canvas.width) * DOMAIN_RANGE;
            const y = DOMAIN_MIN + ((canvas.height - py) / canvas.height) * DOMAIN_RANGE; // Invert Y
            
            const val = f_Frog(x, y);
            
            const normalized = Math.max(0, Math.min(1, (val + 1000) / 2000));
            const hue = 240 - (normalized * 240); // Blue to Red
            ctx.fillStyle = `hsl(${hue}, 70%, 15%)`; 
            ctx.fillRect(px, py, resolution, resolution);
          }
        }
      }
    }
    return bgCanvasRef.current;
  }, []);

  // Handle resize matching
  useEffect(() => {
    let resizeTimer: number;
    
    const handleResize = () => {
      // Debounce resize to avoid freezing
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (canvasRef.current) {
          const parent = canvasRef.current.parentElement;
          if (parent) {
            canvasRef.current.width = parent.clientWidth;
            canvasRef.current.height = parent.clientHeight;
            // Force background regeneration on resize
            bgCanvasRef.current = null;
            generateBackground(canvasRef.current);
            // Ignore foreground render here, it's queued in the other effect
          }
        }
      }, 100);
    };
    
    handleResize(); // Initial setup
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [generateBackground]);

  const renderForeground = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Ensure bg exists
    const bg = bgCanvasRef.current || generateBackground(canvas);

    // Disable smoothing for speed
    ctx.imageSmoothingEnabled = false;

    // Helper to map domain coordinates to screen pixels
    const toScreen = (x: number, y: number) => {
      const px = ((x - DOMAIN_MIN) / DOMAIN_RANGE) * canvas.width;
      const py = canvas.height - (((y - DOMAIN_MIN) / DOMAIN_RANGE) * canvas.height);
      return { px, py };
    };

    // Draw background (overwriting everything)
    ctx.drawImage(bg, 0, 0);

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

    // Limit neighbors drawn if there are thousands
    const displayNeighbors = stepData.neighbors.length > 500 
        ? stepData.neighbors.filter((_, i) => i % Math.ceil(stepData.neighbors.length / 500) === 0)
        : stepData.neighbors;

    // Draw Neighbors
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    for (const neighbor of displayNeighbors) {
      const { px, py } = toScreen(neighbor.x, neighbor.y);
      // Use rects instead of arcs for speed
      ctx.rect(px - 1, py - 1, 2, 2);
    }
    ctx.fill();

    // Draw best neighbor if found
    if (stepData.bestNeighbor) {
      const best = toScreen(stepData.bestNeighbor.x, stepData.bestNeighbor.y);
      const current = toScreen(stepData.currentPoint.x, stepData.currentPoint.y);
      
      ctx.strokeStyle = '#5EEAD4'; 
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); 
      ctx.beginPath();
      ctx.moveTo(current.px, current.py);
      ctx.lineTo(best.px, best.py);
      ctx.stroke();
      ctx.setLineDash([]); 

      ctx.fillStyle = '#C7D2FE'; 
      ctx.beginPath();
      ctx.rect(best.px - 3, best.py - 3, 6, 6);
      ctx.fill();
    }

    // Draw Current Point
    const current = toScreen(stepData.currentPoint.x, stepData.currentPoint.y);
    ctx.fillStyle = '#5EEAD4';
    ctx.beginPath();
    ctx.arc(current.px, current.py, 5, 0, 2 * Math.PI);
    ctx.fill();

  }, [stepData, DOMAIN_MAX, DOMAIN_MIN, DOMAIN_RANGE, generateBackground]);

  // Render updates
  useEffect(() => {
    // Wrap in requestAnimationFrame for smooth non-blocking execution
    const animationId = requestAnimationFrame(renderForeground);
    return () => cancelAnimationFrame(animationId);
  }, [renderForeground]);

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
