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
    window_size: int
    convergence: bool = False
    converge_threshold: int = 50
    decay_episodes: int = 5000

    @classmethod
    def from_params(cls, params) -> "RunConfig":
        planned_episodes = int(params.episodes)
        return cls(
            episodes=int(1E+7) if params.convergence else planned_episodes,
            decay_episodes=planned_episodes,      
            window_size=min(planned_episodes, int(params.window_size)),
            convergence=bool(params.convergence),
            converge_threshold=int(params.converge_threshold)
        )
            
@dataclass(frozen=True)
class SimulationConfig:
    market: MarketParams
    run: RunConfig