import { useState } from 'react';
import Controls from './components/Controls';
import TrajectoryChart from './components/TrajectoryChart';
import { usePyodide } from './hooks/usePyodide';
import type { MarketConfig, SimulationResults } from './types';

const DEFAULT_CONFIG: MarketConfig = {
  episodes: 5000,
  a: 100,
  b: 2,
  cost: 5,
  windowSize: 100,
};

export default function App() {
    const [config, setConfig] = useState<MarketConfig>(DEFAULT_CONFIG);
    const [isSimulating, setIsSimulating] = useState(false);
    const [results, setResults] = useState<SimulationResults | null>(null);
    const { isLoading, runSimulation } = usePyodide();

    const handleRun = async () => {
        setIsSimulating(true);
        try {
            const output = await runSimulation(config);
            setResults(output);
        } catch (err) {
            console.error('Simulation execution failed:', err);
        } finally {
            setIsSimulating(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Loading Python Environment...</h2>
                <p>Downloading Pyodide WASM runtime into browser.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '850px', margin: '0 auto' }}>
            <h1>Algorithmic Collusion Simulator</h1>
            
            <Controls 
                config={config} 
                setConfig={setConfig} 
                onRun={handleRun} 
                isSimulating={isSimulating} 
            />

            {results && (
                <>
                    <div style={{ 
                    background: '#ffffff', 
                    border: '1px solid #e0e0e0', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
                    }}>
                        <h3 style={{ marginTop: 0 }}>Simulation Results</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                            <div><strong>Marginal Cost:</strong> €{results.benchmarks.marginal_cost}</div>
                            <div><strong>Bertrand Price:</strong> €{results.benchmarks.bertrand_price}</div>
                            <div><strong>Monopoly Price:</strong> €{results.benchmarks.monopoly_price}</div>
                            <div><strong>Learned Price:</strong> €{results.final_avg_joint_price}</div>
                        </div>
                    </div>

                    <TrajectoryChart 
                        trajectory={results.trajectory} 
                        benchmarks={results.benchmarks} 
                    />
                </>
            )}
        </div>
    );
}