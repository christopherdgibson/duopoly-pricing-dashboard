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
    def from_params(cls, params: MarketParams, n_prices: int = 15, allow_sub_cost: bool = False) -> "MarketSimulation":
        env = DuopolyPricingEnv(
            demand_intercept=params.demand_intercept, 
            demand_slope=params.demand_slope, 
            cost=[params.marginal_cost_1, params.marginal_cost_2],
            price_grid = DuopolyPricingEnv.generate_price_grid(params.demand_intercept, params.marginal_cost_1, params.marginal_cost_2, n_prices, allow_sub_cost)
        )
        agent1 = QLearningAgent(n_prices=env.n_prices, alpha=params.alpha, epsilon=params.epsilon)
        agent2 = QLearningAgent(n_prices=env.n_prices, alpha=params.alpha, epsilon=params.epsilon)
        benchmarks = MarketBenchmarks(
            market_demand=params.market_demand,
            demand_intercept=params.demand_intercept, 
            demand_slope=params.demand_slope,
            elasticity_ij=params.elasticity_ij,
            cost=[params.marginal_cost_1, params.marginal_cost_2]
        )
        
        return cls(env=env, agent1=agent1, agent2=agent2, benchmarks=benchmarks)
