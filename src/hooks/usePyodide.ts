import { useState, useEffect } from 'react';
import type {MarketConfig, SimulationResults} from '../types';

export function usePyodide() {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initPyodide() {
      try {
        const py = await window.loadPyodide();
        await py.loadPackage(['numpy']);

        // Fetch all four Python files
        const [envSrc, agentSrc, benchSrc, mainSrc] = await Promise.all([
          fetch('/python/environment.py').then((res) => res.text()),
          fetch('/python/agent.py').then((res) => res.text()),
          fetch('/python/benchmarks.py').then((res) => res.text()),
          fetch('/python/main.py').then((res) => res.text()),
        ]);

        // Write support modules to the virtual file system
        py.FS.writeFile('environment.py', envSrc);
        py.FS.writeFile('agent.py', agentSrc);
        py.FS.writeFile('benchmarks.py', benchSrc);

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

  const runSimulation = async (config: MarketConfig): Promise<SimulationResults | null> => {
    if (!pyodide) return null;

    try {
      // 1. Fetch function reference from Python global scope
      const runEngine = pyodide.globals.get('run_simulation_engine');

      // 2. Invoke function directly with typed JavaScript parameters
      const pyProxy = runEngine(
        config.episodes,
        config.a,
        config.b,
        config.cost,
        config.windowSize
      );

      // 3. Convert Pyodide dict/proxy object to native JavaScript object
      const jsResult = pyProxy.toJs({ dict_converter: Object.fromEntries }) as SimulationResults;

      // 4. Destroy proxy to prevent WASM memory leaks
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