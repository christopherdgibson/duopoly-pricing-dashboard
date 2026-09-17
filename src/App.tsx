import { createElement, useState } from 'react';
import { usePyodide } from './hooks/usePyodide';
import type { MarketConfig, SimulationResults } from './types';
import type { Dispatch, SetStateAction } from "react";

interface AppProps {
  initialConfig?: Partial<MarketConfig>;
}

const DEFAULT_CONFIG: MarketConfig = {
  episodes: 5000,
  a: 100,
  b: 2,
  cost: 5,
  windowSize: 100,
};

export default function App({initialConfig}: AppProps) {

    const { isLoading, runSimulation } = usePyodide();
    const [isSimulating, setIsSimulating] = useState(false);
    const [results, setResults] = useState<SimulationResults | null>(null);

    const [config, setConfig] = useState<MarketConfig>({
        ...DEFAULT_CONFIG,
        ...initialConfig,
    });

    const handleRun = async () => {
        setIsSimulating(true);
        const output = await runSimulation(config);
        setResults(output);
        setIsSimulating(false);
    };

    if (isLoading) {
        return createElement('div', { style: { padding: '20px' } },
        createElement('h2', null, 'Loading Python Environment...'),
        createElement('p', null, 'Downloading Pyodide WASM into browser.')
        );
    }

    return createElement('div', { style: { padding: '20px', maxWidth: '800px', margin: '0 auto' } },
        createElement('h1', null, 'Algorithmic Collusion Simulator'),
        createElement('div', { style: { background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' } },
            createElement('h3', null, 'Market Parameters'),
            createElement('button', {
                onClick: handleRun,
                disabled: isSimulating,
                style: { padding: '10px 20px', cursor: isSimulating ? 'not-allowed' : 'pointer' }
            }, isSimulating ? 'Running Python in Browser...' : 'Run Simulation')
        ),
        results && createElement('div', { style: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px' } },
            createElement('h3', null, 'Simulation Results'),
            createElement('p', null, 'Marginal Cost: $' + results.benchmarks.marginal_cost),
            createElement('p', null, 'Bertrand Price: $' + results.benchmarks.bertrand_price),
            createElement('p', null, 'Monopoly Price: $' + results.benchmarks.monopoly_price),
            createElement('p', null, 'Learned Joint Price: $' + results.final_avg_joint_price)
        )
    );
}