from dataclasses import dataclass, field
from environment import DuopolyPricingEnv
from agent import QLearningAgent
from benchmarks import MarketBenchmarks
from config import MarketParams

@dataclass
class MarketSimulation:
    env: DuopolyPricingEnv
    agent1: QLearningAgent
    agent2: QLearningAgent
    benchmarks: MarketBenchmarks
    
    state: tuple[int, int] = (0, 0)
    streak1: int = 1
    streak2: int = 1
    
    all_p1: list[float] = field(default_factory=list)
    all_p2: list[float] = field(default_factory=list)
    all_r1: list[float] = field(default_factory=list)
    all_r2: list[float] = field(default_factory=list)
    all_optimal_a1: list[int] = field(default_factory=list)
    all_optimal_a2: list[int] = field(default_factory=list)
    trajectory: list[dict] = field(default_factory=list)

    @classmethod
    def from_params(cls, params: MarketParams) -> "MarketSimulation":
        env = DuopolyPricingEnv(
            a=params.demand_intercept, 
            b=params.demand_slope, 
            cost=[params.marginal_cost_1, params.marginal_cost_2]
        )
        agent1 = QLearningAgent(n_prices=env.n_prices, alpha=params.alpha, epsilon=params.epsilon)
        agent2 = QLearningAgent(n_prices=env.n_prices, alpha=params.alpha, epsilon=params.epsilon)
        benchmarks = MarketBenchmarks(
            a=params.demand_intercept, 
            b=params.demand_slope, 
            cost=[params.marginal_cost_1, params.marginal_cost_2]
        )
        
        return cls(env=env, agent1=agent1, agent2=agent2, benchmarks=benchmarks)