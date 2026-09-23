// Define configuration interface for sliders
export interface MarketConfig {
  demand_intercept: number;
  demand_slope: number;
  marginal_cost_1: number;
  marginal_cost_2: number;
  alpha: number;
  epsilon: number;
}

export interface RunConfig {
  episodes: number;
  window_size: number;
  convergence: boolean;
  converge_threshold: number;
}

export interface SimulationPayload {
  market: MarketConfig;
  run: RunConfig;
}

export interface TrajectoryProps {
  episode: number;
  avg_price1: number;
  avg_price2: number;
  avg_profit1: number;
  avg_profit2: number;
  avg_optimal_a1: number;
  avg_optimal_a2: number;
}

export interface BenchmarkProps {
  marginal_cost: number;
  bertrand_price: number;
  bertrand_profit_per_firm: number;
  monopoly_price: number;
  monopoly_profit_per_firm: number;
}

export interface FinalAverageProps {
  final_avg_p1: number;
  final_avg_p2: number;
  final_avg_joint_price: number;
  final_avg_profit1: number;
  final_avg_profit2: number;
  final_streak1: number;
  final_streak2: number;
  episodes_to_converge: number;
}

export interface SimulationResults {
  trajectory: Array<TrajectoryProps>;
  benchmarks: BenchmarkProps;
  final_averages: FinalAverageProps;
}

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<any>;
  }
}
