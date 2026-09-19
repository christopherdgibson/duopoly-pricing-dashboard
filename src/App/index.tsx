import { useState } from 'react';
import Controls from '../components/Controls';
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
  const [results, setResults] = useState<SimulationResults | null>(null);
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
          <div className={styles.resultsCard}>
            <h3 className={styles.resultsTitle}>Simulation Results</h3>
            <div className={styles.resultsGrid}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Marginal Cost</span>
                <span className={styles.metricValue}>€{results.benchmarks.marginal_cost}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Bertrand Price</span>
                <span className={styles.metricValue}>€{results.benchmarks.bertrand_price}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Monopoly Price</span>
                <span className={styles.metricValue}>€{results.benchmarks.monopoly_price}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Learned Price</span>
                <span className={styles.metricValue}>€{results.final_averages.final_avg_joint_price}</span>
              </div>
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