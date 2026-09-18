import type { MarketConfig } from '../types';
import type { Dispatch, SetStateAction } from 'react';

interface ControlsProps {
  config: MarketConfig;
  setConfig: Dispatch<SetStateAction<MarketConfig>>;
  onRun: () => void;
  isSimulating: boolean;
}

export default function Controls({ config, setConfig, onRun, isSimulating }: ControlsProps) {
  const handleChange = (field: keyof MarketConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: Number(value) }));
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Market & Algorithm Parameters</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <label>
          Demand Intercept (a):
          <input
            type="number"
            value={config.a}
            onChange={(e) => handleChange('a', e.target.value)}
            style={{ width: '100%', marginTop: '5px', padding: '6px' }}
          />
        </label>

        <label>
          Cross-Price Elasticity (b):
          <input
            type="number"
            value={config.b}
            onChange={(e) => handleChange('b', e.target.value)}
            style={{ width: '100%', marginTop: '5px', padding: '6px' }}
          />
        </label>

        <label>
          Marginal Cost (c):
          <input
            type="number"
            value={config.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            style={{ width: '100%', marginTop: '5px', padding: '6px' }}
          />
        </label>

        <label>
          Episodes:
          <input
            type="number"
            value={config.episodes}
            onChange={(e) => handleChange('episodes', e.target.value)}
            style={{ width: '100%', marginTop: '5px', padding: '6px' }}
          />
        </label>
      </div>

      <button
        onClick={onRun}
        disabled={isSimulating}
        style={{
          padding: '10px 24px',
          backgroundColor: isSimulating ? '#6c757d' : '#0d6efd',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: isSimulating ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {isSimulating ? 'Running Pyodide (WASM)...' : 'Run Simulation'}
      </button>
    </div>
  );
}