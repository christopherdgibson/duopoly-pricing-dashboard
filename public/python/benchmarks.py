from config import MarketParams
from dataclasses import dataclass
from environment import LinearDemand

@dataclass(frozen=True)
class FirmBenchmark:
    firm: int
    marginal_cost: float
    bertrand_price: float
    monopoly_price: float

class MarketBenchmarks:
    """
    Computes analytical benchmark equilibrium prices and profits for a
    symmetric linear duopoly:
        q_i = a - p_i + b*(p_j - p_i)
    """
    def __init__(self, market_demand: str, demand_intercept: float, demand_slope: float, elasticity_ij: float, cost: list[float] | float):
        self.market_demand = market_demand
        self.demand_intercept = demand_intercept
        self.demand_slope = demand_slope
        self.elasticity_ij = elasticity_ij
        
        # Handle both single float and list/tuple inputs
        if isinstance(cost, (list, tuple)):
            self.c1, self.c2 = cost[0], cost[1]
        else:
            self.c1 = self.c2 = float(cost)

    @property
    def bertrand_prices(self) -> tuple[float, float]:
        demand = LinearDemand(
            demand_intercept = self.demand_intercept,
            demand_slope = self.demand_slope,
            elasticity_ij = self.elasticity_ij
        )
        # print('demand: ', demand)
        pb = demand.bertrand_equilibrium(self.c1, self.c2)
        """Asymmetric Bertrand-Nash equilibrium prices."""
        # p1 = self.bertrand_price(self.c1, self.c2)
        # p2 = self.bertrand_price(self.c2, self.c1)
        # return p1, p2
        return pb

    @property
    def monopoly_prices(self) -> tuple[float, float]:
        """Monopoly Maximizing Prices."""
        p1 = self.monopoly_price(self.c1)
        p2 = self.monopoly_price(self.c2)
        # print('monopoly price:', p1)
        return p1, p2

    @property
    def benchmarks(self) -> FirmBenchmark:
        (pb1, pb2) = self.bertrand_prices
        (pm1, pm2) = self.monopoly_prices

        benchmarks = [
            {
                "firm": 1,
                "marginal_cost": self.c1,
                "bertrand_price": pb1,
                "monopoly_price": pm1
            }
        ]

        if self.c1 != self.c2:
            benchmarks.append(
                {
                    "firm": 2,
                    "marginal_cost": self.c2,
                    "bertrand_price": pb2,
                    "monopoly_price": pm2
                }
            )

        return benchmarks


    @property
    def summary(self) -> dict:
        p_b = max(self.bertrand_prices)
        p_m = max(self.monopoly_prices)
        
        prof_b = max(self.compute_profit(p_b, p_b))
        prof_m = max(self.compute_profit(p_m, p_m))
        
        return {
            "marginal_cost_1": self.c1,
            "marginal_cost_2": self.c2,
            "bertrand_price": round(p_b, 2),
            "bertrand_profit_per_firm": round(prof_b, 2),
            "monopoly_price": round(p_m, 2),
            "monopoly_profit_per_firm": round(prof_m, 2)
        }
    
    def bertrand_price(self, ci: float, cj: float) -> float:
        """Non-cooperative Bertrand-Nash Equilibrium Price."""
        # For linear demand: p_i = (a / (2 + b)) + ((1 + b) * (2 * (1 + b) * ci + b * cj)/((2 + 3 * b) * (2 + b)))
        return (self.demand_intercept/(2 + self.demand_slope))  + ((1 + self.demand_slope) * (2 * (1 + self.demand_slope) * ci + self.demand_slope * cj)/((2 + 3 * self.demand_slope) * (2 + self.demand_slope)))

    def monopoly_price(self, ci: float) -> float:
        """Cooperative / Monopoly Joint-Profit Maximizing Price."""
        return (self.demand_intercept + ci) / 2.0

    def compute_profit(self, p1: float, p2: float) -> tuple[float, float]:
        """Calculates exact stage-game profits given arbitrary prices p1 and p2."""
        q1 = max(0.0, self.demand_intercept - p1 + self.demand_slope * (p2 - p1))
        q2 = max(0.0, self.demand_intercept - p2 + self.demand_slope * (p1 - p2))
        
        profit1 = (p1 - self.c1) * q1
        profit2 = (p2 - self.c2) * q2
        return profit1, profit2

    @classmethod
    def from_params(cls, params: MarketParams) -> "MarketBenchmarks":
        return cls(
            market_demand=params.market_demand,
            demand_intercept=params.demand_intercept,
            demand_slope=params.demand_slope,
            elasticity_ij = params.elasticity_ij,
            cost=[params.marginal_cost_1, params.marginal_cost_2]
        )

if __name__ == "__main__":
    benchmarks = MarketBenchmarks(market_demand='linear', demand_intercept=100.0, demand_slope=3.0, elasticity_ij = 2.0, cost=5.0)
    print("--- Theoretical Economic Benchmarks ---")
    for key, val in benchmarks.summary.items():
        print(f"{key}: {val}")