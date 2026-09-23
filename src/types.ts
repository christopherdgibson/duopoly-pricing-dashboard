// Define configuration interface for sliders
export interface MarketConfig {
  // Simulation & Smoothing
  episodes: number;
  windowSize: number;
  convergeThreshold: number;

  // Economic Environment
  demandIntercept: number;
  demandSlope: number;
  marginalCost: number;

  // Q-Learning Hyperparameters
  alpha: number;            // Learning rate (how aggressively Q-values update)
  epsilon: number;          // Initial exploration probability
}

export interface SimulationConfig {
  convergence: boolean;
  marketConfig: MarketConfig;
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
