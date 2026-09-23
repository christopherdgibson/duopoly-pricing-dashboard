from dataclasses import dataclass

@dataclass(frozen=True)
class MarketParams:
    demand_intercept: float
    demand_slope: float
    marginal_cost_1: float
    marginal_cost_2: float
    alpha: float
    epsilon: float

@dataclass(frozen=True)
class RunConfig:
    episodes: int
    decay_episodes: int
    window_size: int
    convergence: bool = False
    converge_threshold: int = 50

@dataclass(frozen=True)
class SimulationConfig:
    market: MarketParams
    run: RunConfig