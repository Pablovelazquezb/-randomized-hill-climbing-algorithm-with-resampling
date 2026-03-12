import { useState, useEffect, useRef } from 'react';
import { Settings2, Play, Square, FastForward, RotateCcw } from 'lucide-react';
import { RHCR2_Generator, type StepData } from './utils/rhcr2';
import { Visualizer } from './components/Visualizer';

function App() {
  // Config state
  const [p, setP] = useState(120);
  const [z, setZ] = useState(9);
  const [seed, setSeed] = useState(42);
  const [spX, setSpX] = useState(-300);
  const [spY, setSpY] = useState(-400);

  // Execution state
  const [generator, setGenerator] = useState<Generator<StepData, StepData, void> | null>(null);
  const [stepData, setStepData] = useState<StepData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(500); // Animation delay

  const intervalRef = useRef<number | null>(null);

  // Initialize algorithmic generator
  const initializeRun = () => {
    const gen = RHCR2_Generator(spX, spY, p, z, seed);
    setGenerator(gen);
    
    // Get first step
    const firstState = gen.next().value;
    if (firstState) setStepData(firstState);
    setIsPlaying(false);
  };

  // Run automatically when playing
  useEffect(() => {
    if (isPlaying && generator) {
      intervalRef.current = window.setInterval(() => {
        handleStep();
      }, speedMs);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, generator, speedMs]);

  const handleStep = () => {
    if (!generator) return;
    const nextState = generator.next();
    if (nextState.value) {
      setStepData(nextState.value);
      if (nextState.value.isFinished) {
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = () => {
    if (!generator) {
      initializeRun();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setGenerator(null);
    setStepData(null);
  };

  return (
    <div className="app-container">
      <div className="visualizer-container">
        <Visualizer stepData={stepData} />
      </div>

      <div className="controls-sidebar glass-panel">
        <div className="brand">
          <div className="icon-wrapper">
            <Settings2 size={24} />
          </div>
          <h1>RHCR2 Visualizer</h1>
        </div>

        <div className="control-group">
          <label>Starting Point (sp)</label>
          <div className="input-row">
            <input 
              type="number" 
              value={spX} 
              onChange={e => setSpX(Number(e.target.value))} 
              disabled={isPlaying || stepData !== null}
              placeholder="X (-512 to 512)"
            />
            <input 
              type="number" 
              value={spY} 
              onChange={e => setSpY(Number(e.target.value))} 
              disabled={isPlaying || stepData !== null}
              placeholder="Y (-512 to 512)"
            />
          </div>
        </div>

        <div className="control-group">
          <label>Resampling Rate (p)</label>
          <input 
            type="number" 
            value={p} 
            onChange={e => setP(Number(e.target.value))} 
            disabled={isPlaying || stepData !== null}
            min="1"
          />
        </div>

        <div className="control-group">
          <label>Jump Distance (z)</label>
          <input 
            type="number" 
            value={z} 
            onChange={e => setZ(Number(e.target.value))} 
            disabled={isPlaying || stepData !== null}
            min="1"
          />
        </div>

        <div className="control-group">
          <label>Random Seed</label>
          <input 
            type="number" 
            value={seed} 
            onChange={e => setSeed(Number(e.target.value))} 
            disabled={isPlaying || stepData !== null}
          />
        </div>

        <div className="control-group">
          <label>Animation Speed (ms delay)</label>
          <select 
            className="input-field" 
            value={speedMs} 
            onChange={e => setSpeedMs(Number(e.target.value))}
          >
            <option value={1000}>Slow (1000ms)</option>
            <option value={500}>Normal (500ms)</option>
            <option value={100}>Fast (100ms)</option>
            <option value={10}>Max Speed (10ms)</option>
          </select>
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-primary" 
            onClick={handlePlayPause}
            disabled={stepData?.isFinished && !isPlaying}
          >
            {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            {isPlaying ? 'Pause' : stepData ? 'Resume' : 'Start Execution'}
          </button>
          
          <div className="input-row">
            <button 
              className="btn" 
              style={{flex: 1}}
              onClick={handleStep}
              disabled={isPlaying || stepData?.isFinished}
            >
              <FastForward size={18} />
              Step
            </button>
            
            <button 
              className="btn" 
              style={{flex: 1}}
              onClick={handleReset}
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>

        <div className="stats-panel">
          <div className="stat-row">
            <span className="stat-label">Status</span>
            <span className="stat-value">
              {stepData?.isFinished ? <span style={{color: 'var(--danger)'}}>TERMINATED</span> : isPlaying ? 'RUNNING' : 'IDLE'}
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Iteration</span>
            <span className="stat-value">{stepData?.iteration ?? 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">f() Evaluations</span>
            <span className="stat-value">{stepData?.fCalls ?? 0}</span>
          </div>
          <div className="stat-row" style={{marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--panel-border)'}}>
            <span className="stat-label">Current Min Value</span>
            <span className="stat-value">{stepData?.currentVal?.toFixed(4) ?? '---'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
