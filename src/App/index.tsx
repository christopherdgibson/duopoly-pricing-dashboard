import { useState } from 'react';
import Controls from '../components/Controls';
import { BenchmarkResultsCard, SimulationResultsCard} from '../components/ResultsCard'
import { TrajectoryChart } from '../components/TrajectoryChart';
import { usePyodide } from '../hooks/usePyodide';
import type { MarketConfig, RunConfig, SimulationPayload, SimulationResults } from '../types';
import styles from './App.module.css';

const DEFAULT_MARKET_CONFIG: MarketConfig = {
  demand_intercept: 100,
  demand_slope: 2,
  marginal_cost_1: 5,
  marginal_cost_2: 5,
  alpha: 0.15,     // Standard Q-learning rate
  epsilon: 0.20,   // Starts with 20% random exploration
};

const DEFAULT_RUN_CONFIG: RunConfig = {
  episodes: 5000,
  window_size: 100,
  convergence: false,
  converge_threshold: 50
};

export default function App() {
  const [payload, setPayload] = useState<SimulationPayload>({market: DEFAULT_MARKET_CONFIG, run: DEFAULT_RUN_CONFIG});
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Array<SimulationResults> | null>(null);
  const { isLoading, runSimulation } = usePyodide('run_simulation_engine');

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const output = await runSimulation(payload.market, payload.run);
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
        payload={payload}
        onChange={setPayload}
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
            <>
              <TrajectoryChart
                trajectory={results[0].trajectory}
                benchmarks={results[0].benchmarks}
                dataKey1={"avg_price1"}
                dataKey2={"avg_price2"}
                name1={"Firm 1 Price"}
                name2={"Firm 2 Price"}
                formatType={"currency"}
                xLabel={'Episode'}
                yLabel={'Price (€)'}
              />
              <TrajectoryChart
                title={"Optimal Actions"}
                trajectory={results[0].trajectory}
                dataKey1={"avg_optimal_a1"}
                dataKey2={"avg_optimal_a2"}
                name1={"Firm 1 Optimal Action"}
                name2={"Firm 2 Optimal Action"}
                formatType={"integer"}
                xLabel={'Episode'}
                yLabel={'Action'}
              />
            </>
          )}
          {results.length > 1 && (
            <>
              <TrajectoryChart
                title={"Price Trajectory vs Economic Benchmarks - Symmetric Costs"}
                trajectory={results[0].trajectory}
                benchmarks={results[0].benchmarks}
                dataKey1={"avg_price1"}
                dataKey2={"avg_price2"}
                name1={"Firm 1 Price"}
                name2={"Firm 2 Price"}
                formatType={"currency"}
                xLabel={'Episode'}
                yLabel={'Price (€)'}
              />
              <TrajectoryChart
                title={"Price Trajectory vs Economic Benchmarks - Asymmetric Costs"}
                trajectory={results[1].trajectory}
                benchmarks={results[1].benchmarks}
                dataKey1={"avg_price1"}
                dataKey2={"avg_price2"}
                name1={"Firm 1 Price"}
                name2={"Firm 2 Price"}
                formatType={"currency"}
                xLabel={'Episode'}
                yLabel={'Price (€)'}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}