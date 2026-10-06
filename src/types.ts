export type DemandTypeKey = 'linear' | 'logit';


export type DemandInputs = LinearDemandInputs | LogitDemandInputs;

export interface DemandInputsMap {
  linear: LinearDemandInputs;
  logit: LogitDemandInputs;
}

// A generic MarketConfig enforcing the matching demand input
export type MarketConfig<K extends keyof DemandInputsMap = keyof DemandInputsMap> = K extends any 
  ? {
      demand_type: K;
      demand_inputs: DemandInputsMap[K];
      marginal_cost_1: number;
      marginal_cost_2: number;
      alpha: number;
      epsilon: number;
    }
  : never;

export interface LinearDemandInputs {
  type: 'linear';
  demand_intercept: number;
  demand_slope: number;
  elasticity_ij: number;
}

export interface LogitDemandInputs {
  type: 'logit';
  market_size: number;
  price_sensitivity: number;
  nesting_parameter?: number; // Optional nested logit param
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

export interface ControlsBase {
  isRunning: boolean;
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

export interface FirmBenchmarkResults {
  firm: number;
  marginal_cost: number;
  bertrand_price: number;
  monopoly_price: number;
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
  final_averages: FinalAverageProps;
}

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<any>;
  }
}
