import { useState, useEffect } from 'react';
import type { MarketConfig, RunConfig, SimulationPayload, SimulationResults } from '../types';

export function usePyodide(simulation: string) {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    async function initPyodide() {
      try {
        const py = await window.loadPyodide();
        await py.loadPackage(['numpy']);

        // Fetch all four Python files
        const [configSrc, envSrc, agentSrc, benchSrc, simSrc, mainSrc] = await Promise.all([
          fetch(`${base}python/config.py`).then((res) => res.text()),
          fetch(`${base}python/environment.py`).then((res) => res.text()),
          fetch(`${base}python/agent.py`).then((res) => res.text()),
          fetch(`${base}python/benchmarks.py`).then((res) => res.text()),
          fetch(`${base}python/simulation.py`).then((res) => res.text()),
          fetch(`${base}python/main.py`).then((res) => res.text()),
        ]);

        // Write support modules to the virtual file system
        py.FS.writeFile('config.py', configSrc);
        py.FS.writeFile('environment.py', envSrc);
        py.FS.writeFile('agent.py', agentSrc);
        py.FS.writeFile('benchmarks.py', benchSrc);
        py.FS.writeFile('simulation.py', simSrc);

        // Execute main.py once to load run_simulation_engine into Python's global scope
        await py.runPythonAsync(mainSrc);

        setPyodide(py);
      } catch (err) {
        console.error('Pyodide initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initPyodide();
  }, []);

  const runSimulation = async (market: MarketConfig, run: RunConfig): Promise<Array<SimulationResults> | null> => {
    if (!pyodide) return null;

    try {
      // 1. Fetch function reference from Python global scope
      const runEngine = pyodide.globals.get(simulation);

      // 2. Construct function input object
      const payload: SimulationPayload = {
        market: {
          demand_intercept: market.demand_intercept,
          demand_slope: market.demand_slope,
          marginal_cost_1: market.marginal_cost_1,
          marginal_cost_2: market.marginal_cost_2,
          alpha: market.alpha,
          epsilon: market.epsilon,
        },
        run: {
          episodes: run.episodes,
          window_size: run.window_size,
          convergence: run.convergence,
          converge_threshold: run.converge_threshold,
        }
      };

      // 3. Invoke function directly with typed JavaScript parameters
      const pyProxy = runEngine(payload);

      // 4. Convert Pyodide dict/proxy object to native JavaScript object
      const jsResult = pyProxy.toJs({ dict_converter: Object.fromEntries }) as Array<SimulationResults>;

      // 5. Destroy proxy to prevent WASM memory leaks
      pyProxy.destroy();
      runEngine.destroy();

      return jsResult;
    } catch (error) {
      console.error('Python execution error:', error);
      throw error;
    }
  };

  return { isLoading, runSimulation };
}