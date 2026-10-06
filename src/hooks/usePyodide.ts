import { useCallback, useState, useEffect } from 'react';
import type { FirmBenchmarkResults, MarketConfig, RunConfig, SimulationPayload, SimulationResults } from '../types';

interface PyFunctionProps {
  fnName: string;
  args?: any[];
}

type CallPyFunction = <T,>(props: PyFunctionProps) => Promise<T | null>;

export function usePyodide() {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const base = import.meta.env.BASE_URL;

  // Initialize Pyodide WASM Runtime
  useEffect(() => {
    async function initPyodide() {
      try {
        const py = await window.loadPyodide();
        await py.loadPackage(['numpy']);

        // Fetch all four Python files
        const [agentSrc, benchSrc, configSrc, demandSrc, envSrc, simSrc, mainSrc] = await Promise.all([
          fetch(`${base}python/agent.py`).then((res) => res.text()),
          fetch(`${base}python/benchmarks.py`).then((res) => res.text()),
          fetch(`${base}python/config.py`).then((res) => res.text()),
          fetch(`${base}python/demand.py`).then((res) => res.text()),
          fetch(`${base}python/environment.py`).then((res) => res.text()),
          fetch(`${base}python/simulation.py`).then((res) => res.text()),
          fetch(`${base}python/main.py`).then((res) => res.text()),
        ]);

        // Write support modules to the virtual file system
        py.FS.writeFile('agent.py', agentSrc);
        py.FS.writeFile('benchmarks.py', benchSrc);
        py.FS.writeFile('config.py', configSrc);
        py.FS.writeFile('demand.py', demandSrc);
        py.FS.writeFile('environment.py', envSrc);        
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

  // Centralized Pyodide Invocation Wrapper
  const callPyFunction = useCallback(
    (async <T,>({ fnName, args = [] }: PyFunctionProps): Promise<T | null> => {
      if (!pyodide) {
        console.warn(`Attempted to call ${fnName} before Pyodide finished loading.`);
        return null;
      }

      let pyFunction: any = null;
      let pyProxy: any = null;

      try {
        // 1. Fetch function reference from Python global namespace
        pyFunction = pyodide.globals.get(fnName);

        if (!pyFunction) {
          throw new Error(`Python function '${fnName}' was not found in global scope.`);
        }

        // 2. Invoke function directly with typed JavaScript parameters
        pyProxy = pyFunction(...args);

        // 3. Convert Pyodide Proxy object to native JavaScript Types
        const jsResult = pyProxy.toJs({ dict_converter: Object.fromEntries }) as T;

        return jsResult;
      } catch (error) {
        console.error(`Error executing Python function '${fnName}':`, error);
        throw error;
      } finally {
        // 4. Clean up WASM proxies to prevent memory leaks
        if (pyProxy && typeof pyProxy.destroy === 'function') pyProxy.destroy();
        if (pyFunction && typeof pyFunction.destroy === 'function') pyFunction.destroy();

        // 5. Run Python Garbage Collection
        try {
          pyodide.runPython('import gc; gc.collect()');
        } catch (gcErr) {
          console.warn('Garbage collection trigger failed:', gcErr);
        }
      }
    }) as CallPyFunction, [pyodide]
  );

  const getBenchmarks = useCallback(
    async (market: MarketConfig): Promise<Array<FirmBenchmarkResults> | null> => {
      const benchmarks = await callPyFunction<Array<FirmBenchmarkResults>>({
        fnName: 'get_benchmarks',
        args: [market],
      });

      return benchmarks;
    }, [callPyFunction]
);

  const runSimulation = useCallback(
    async (market: MarketConfig, run: RunConfig): Promise<Array<SimulationResults> | null> => {
      const payload: SimulationPayload = {market, run}

      const results = await callPyFunction<Array<SimulationResults>>({
        fnName: 'run_simulation_engine',
        args: [payload],
      });

      return results;
    }, [callPyFunction]
);

  return { isLoading, getBenchmarks, runSimulation };
}