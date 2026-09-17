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

        const [envSrc, agentSrc, benchSrc] = await Promise.all([
          fetch('/python/environment.py').then((res) => res.text()),
          fetch('/python/agent.py').then((res) => res.text()),
          fetch('/python/benchmarks.py').then((res) => res.text()),
        ]);

        py.FS.writeFile('environment.py', envSrc);
        py.FS.writeFile('agent.py', agentSrc);
        py.FS.writeFile('benchmarks.py', benchSrc);

        // Define Python runner function once in Python's global namespace
        const pythonScriptString = `
import numpy as np
from environment import DuopolyPricingEnv
from agent import QLearningAgent
from benchmarks import MarketBenchmarks

def run_simulation_engine(episodes, a, b, cost, window_size):
    env = DuopolyPricingEnv(a=a, b=b, cost=cost)
    agent1 = QLearningAgent(env.n_prices)
    agent2 = QLearningAgent(env.n_prices)
    benchmarks = MarketBenchmarks(a=a, b=b, cost=cost)

    state = (0, 0)
    all_p1, all_p2 = [], []
    trajectory = []

    for ep in range(int(episodes)):
        epsilon = max(0.01, 0.2 * (1 - ep / episodes))
        agent1.epsilon = epsilon
        agent2.epsilon = epsilon

        a1 = agent1.select_action(state)
        a2 = agent2.select_action(state)

        next_state, r1, r2 = env.step(a1, a2)
        agent1.update_q_value(state, a1, r1, next_state)
        agent2.update_q_value(state, a2, r2, next_state)

        state = next_state
        all_p1.append(float(env.prices[a1]))
        all_p2.append(float(env.prices[a2]))

        if (ep + 1) % int(window_size) == 0:
            start = ep + 1 - int(window_size)
            trajectory.append({
                "episode": ep + 1,
                "avg_price1": float(np.mean(all_p1[start:ep + 1])),
                "avg_price2": float(np.mean(all_p2[start:ep + 1])),
            })

    last_10_pct = int(episodes * 0.10)
    final_avg_p1 = float(np.mean(all_p1[-last_10_pct:]))
    final_avg_p2 = float(np.mean(all_p2[-last_10_pct:]))
    joint_avg = (final_avg_p1 + final_avg_p2) / 2.0

    return {
        "trajectory": trajectory,
        "benchmarks": benchmarks.summary(),
        "final_avg_joint_price": round(joint_avg, 4)
    }
`;
        await py.runPythonAsync(pythonScriptString);
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