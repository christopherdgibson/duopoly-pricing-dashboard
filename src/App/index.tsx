import { useState } from 'react';
import Controls from '../components/Controls';
import { BenchmarkResultsCard, SimulationResultsCard} from '../components/ResultsCard'
import TrajectoryChart from '../components/TrajectoryChart';
import { usePyodide } from '../hooks/usePyodide';
import type { MarketConfig, SimulationResults } from '../types';
import styles from './App.module.css';

const DEFAULT_CONFIG: MarketConfig = {
  episodes: 5000,
  windowSize: 100,
  demandIntercept: 100,
  demandSlope: 2,
  marginalCost: 5,
  alpha: 0.15,     // Standard Q-learning rate
  epsilon: 0.20,   // Starts with 20% random exploration
};

export default function App() {
  const [config, setConfig] = useState<MarketConfig>(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Array<SimulationResults> | null>(null);
  const { isLoading, runSimulation } = usePyodide();

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const output = await runSimulation(config);
      setResults(output);
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <h2 className={styles.loadingTitle}>Loading Python Environment...</h2>
        <p className={styles.loadingText}>Downloading Pyodide WASM runtime into browser.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Algorithmic Collusion Simulator</h1>

      <Controls
        config={config}
        onChange={setConfig}
        onRunSimulation={handleRun}
        isRunning={isRunning}
      />

      {results && (
        <>
          <BenchmarkResultsCard benchmarks={results[0].benchmarks} />
          
          {results.length <= 1 && (
            <SimulationResultsCard final_averages={results[0].final_averages}/>
          )}

          {results.length > 1 && (
            <>
              <SimulationResultsCard title={"Simulation Card - Symmetric Costs"} final_averages={results[0].final_averages}/>
              <SimulationResultsCard title={"Simulation Card - Asymmetric Costs"} final_averages={results[1].final_averages}/>
            </>
          )}

          {results.length <= 1 && (
            <TrajectoryChart
              trajectory={results[0].trajectory}
              benchmarks={results[0].benchmarks}
            />
          )}
          {results.length > 1 && (
            <>
              <TrajectoryChart
                title={"Price Trajectory vs Economic Benchmarks - Symmetric Costs"}
                trajectory={results[0].trajectory}
                benchmarks={results[0].benchmarks}
              />
              <TrajectoryChart
                title={"Price Trajectory vs Economic Benchmarks - Asymmetric Costs"}
                trajectory={results[1].trajectory}
                benchmarks={results[1].benchmarks}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}