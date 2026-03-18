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

  const generateBackground = useCallback((width: number, height: number, dpr: number) => {
    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement('canvas');
      bgCanvasRef.current.width = width * dpr;
      bgCanvasRef.current.height = height * dpr;
      
      const ctx = bgCanvasRef.current.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.scale(dpr, dpr);
        // Render a low-res heat map to save performance
        const resolution = 6; // logical px per block
        for (let px = 0; px < width; px += resolution) {
          for (let py = 0; py < height; py += resolution) {
            // Map logical pixel to domain
            const x = DOMAIN_MIN + (px / width) * DOMAIN_RANGE;
            const y = DOMAIN_MIN + ((height - py) / height) * DOMAIN_RANGE; // Invert Y
            
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
            const dpr = window.devicePixelRatio || 1;
            const w = parent.clientWidth;
            const h = parent.clientHeight;
            
            canvasRef.current.width = w * dpr;
            canvasRef.current.height = h * dpr;
            canvasRef.current.style.width = `${w}px`;
            canvasRef.current.style.height = `${h}px`;
            
            // Force background regeneration on resize
            bgCanvasRef.current = null;
            generateBackground(w, h, dpr);
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
    
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Ensure bg exists
    const bg = bgCanvasRef.current || generateBackground(width, height, dpr);

    ctx.save();
    // Disable smoothing for speed on the background draw
    ctx.imageSmoothingEnabled = false;

    // Draw background (overwriting everything)
    // The bg canvas is already scaled physically, drawImage draws from logical to physical automatically if scaled correctly
    ctx.scale(dpr, dpr);
    // Draw background using logical width/height (because we scaled the context)
    // Wait, drawImage of another canvas that is width*dpr pixels. We should draw it at physical size or logical size
    // We already scaled the ctx, so if we drawImage at logical width/height it will stretch the physical bg. 
    // We should draw the bgCanvas at exactly logical width/height and let context scale it to physical.
    ctx.drawImage(bg, 0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Helper to map domain coordinates to logical screen pixels
    const toLogical = (x: number, y: number) => {
      const px = ((x - DOMAIN_MIN) / DOMAIN_RANGE) * width;
      const py = height - (((y - DOMAIN_MIN) / DOMAIN_RANGE) * height);
      return { px, py };
    };

    if (stepData) {
        // Draw the Historical Path Line
        if (stepData.path && stepData.path.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            
            const firstLogical = toLogical(stepData.path[0].x, stepData.path[0].y);
            ctx.moveTo(firstLogical.px, firstLogical.py);
            
            for (let i = 1; i < stepData.path.length; i++) {
                const lp = toLogical(stepData.path[i].x, stepData.path[i].y);
                ctx.lineTo(lp.px, lp.py);
            }
            
            // Connect to current point if not already there
            const curLp = toLogical(stepData.currentPoint.x, stepData.currentPoint.y);
            ctx.lineTo(curLp.px, curLp.py);
            
            ctx.stroke();
            
            // Add a glowing halo effect to the line
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.shadowBlur = 4;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Limit neighbors drawn if there are thousands
        const displayNeighbors = stepData.neighbors.length > 500 
            ? stepData.neighbors.filter((_, i) => i % Math.ceil(stepData.neighbors.length / 500) === 0)
            : stepData.neighbors;

        // Draw Neighbors
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        for (const neighbor of displayNeighbors) {
          const { px, py } = toLogical(neighbor.x, neighbor.y);
          ctx.rect(px - 1, py - 1, 2, 2);
        }
        ctx.fill();

        // Draw best neighbor if found
        if (stepData.bestNeighbor) {
          const best = toLogical(stepData.bestNeighbor.x, stepData.bestNeighbor.y);
          const current = toLogical(stepData.currentPoint.x, stepData.currentPoint.y);
          
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
        const current = toLogical(stepData.currentPoint.x, stepData.currentPoint.y);
        ctx.fillStyle = '#5EEAD4';
        
        // Slightly larger pulse radius if playing? We can just keep it 5
        ctx.beginPath();
        ctx.arc(current.px, current.py, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.shadowColor = '#5EEAD4';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    ctx.restore();
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
