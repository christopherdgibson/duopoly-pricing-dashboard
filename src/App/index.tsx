import { useEffect, useState } from 'react';
import Controls from '../components/Controls';
import { BenchmarkResultsCard, SimulationResultsCard} from '../components/ResultsCard'
import { TrajectoryChart } from '../components/TrajectoryChart';
import { usePyodide } from '../hooks/usePyodide';
import type { FirmBenchmarkResults, MarketConfig, RunConfig, SimulationPayload, SimulationResults } from '../types';
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
  const [benchmarks, setBenchmarks] = useState<Array<FirmBenchmarkResults> | null>(null);
  const [results, setResults] = useState<Array<SimulationResults> | null>(null);
  const { isLoading, runSimulation, getBenchmarks } = usePyodide('run_simulation_engine');

  useEffect(() => {
    let isMounted = true;

    async function updateBenchmarks(market: MarketConfig) {
      // If Pyodide is still loading, fallback to local JS calculations
      if (isLoading) {
        setBenchmarks(getBenchmarksJS(market));
        return;
      }

      try {
        const pyBenchmarks = await getBenchmarks(market);
        
        if (isMounted) {
          if (pyBenchmarks) {
            setBenchmarks(pyBenchmarks);
          } else {
            // Fallback to local JS if Python returned null
            setBenchmarks(getBenchmarksJS(market));
          }
        }
      } catch (err) {
        console.error('Failed to calculate Pyodide summary prices, falling back to local JS:', err);
        if (isMounted) {
          setBenchmarks(getBenchmarksJS(market));
        }
      }
    }

    updateBenchmarks(payload.market);

    return () => {
      isMounted = false;
    };
  }, [
    isLoading, payload.market, getBenchmarks
  ]);

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

  function getBenchmarksJS(market: MarketConfig): Array<FirmBenchmarkResults> {
    const a = market.demand_intercept;
    const b = market.demand_slope;
    const c1 = market.marginal_cost_1;
    const c2 = market.marginal_cost_2;

    const priceBertrand = (ci: number, cj: number) => {
      return (a / (2 + b)) + ((1 + b) * (2 * (1 + b) * ci + b * cj)/((2 + 3 * b) * (2 + b)));
    }

    const priceMonopoly = (ci: number) => {
      return (a + ci) / 2.0;
    }

    const pb1 = priceBertrand(c1, c2);
    const pm1 = priceMonopoly(c1);

    const benchmarks = [
      {
        firm: 1,
        marginal_cost: c1,
        bertrand_price: pb1,
        monopoly_price: pm1
      },
    ];

    if (c1 !== c2) {
      const pb2 = priceBertrand(c2, c1);
      const pm2 = priceMonopoly(c2);
      benchmarks.push({
        firm: 2,
        marginal_cost: c2,
        bertrand_price: pb2,
        monopoly_price: pm2,
      });
    }
        
    return benchmarks;
  }

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
      
      {benchmarks && <BenchmarkResultsCard benchmarks={benchmarks} />}
      
      {results && (
        <>
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
                benchmarks={benchmarks ?? undefined}
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
                benchmarks={benchmarks ?? undefined}
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
                benchmarks={benchmarks ?? undefined}
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