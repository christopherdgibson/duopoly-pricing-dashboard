// Define configuration interface for sliders
export interface MarketConfig {
  episodes: number;
  a: number;
  b: number;
  cost: number;
  windowSize: number;
}

export interface TrajectoryProps {
    episode: number;
    avg_price1: number;
    avg_price2: number;
  }>;
  benchmarks: {
}

export interface BenchmarkProps {
    marginal_cost: number;
    bertrand_price: number;
    bertrand_profit_per_firm: number;
    monopoly_price: number;
    monopoly_profit_per_firm: number;
}

export interface SimulationResults {
  trajectory: Array<TrajectoryProps>;
  benchmarks: BenchmarkProps;
  final_avg_joint_price: number;
}

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<any>;
  }
}