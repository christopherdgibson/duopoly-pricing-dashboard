from dataclasses import dataclass

from config import MarketParams
from demand import IDemandModel, LinearDemand, LinearDemandInputs

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
    def __init__(self, demand_type: str, demand_model: IDemandModel, cost: list[float] | float):
        self.demand_type = demand_type
        self.demand_model = demand_model
        
        # Handle both single float and list/tuple inputs
        if isinstance(cost, (list, tuple)):
            self.c1, self.c2 = cost[0], cost[1]
        else:
            self.c1 = self.c2 = float(cost)

    @property
    def bertrand_prices(self) -> tuple[float, float]:
        """Asymmetric Bertrand-Nash equilibrium prices."""
        pb = self.demand_model.bertrand_prices(self.c1, self.c2)
        
        return pb

    @property
    def monopoly_prices(self) -> tuple[float, float]:
        """Monopoly Maximizing Prices."""
        pm = self.demand_model.monopoly_prices(self.c1, self.c2)

        return pm

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
        (pb1, pb2) = self.bertrand_prices
        pb = max(pb1, pb2)
        pm = max(self.monopoly_prices)
        
        prof_b = max(self.compute_profit(pb1, pb2))
        prof_m = max(self.compute_profit(pm, pm))
        
        return {
            "marginal_cost_1": self.c1,
            "marginal_cost_2": self.c2,
            "bertrand_price": round(pb, 2),
            "bertrand_profit_per_firm": round(prof_b, 2),
            "monopoly_price": round(pm, 2),
            "monopoly_profit_per_firm": round(prof_m, 2)
        }

    def compute_profit(self, p1: float, p2: float) -> tuple[float, float]:
        """Calculates exact stage-game profits given arbitrary prices p1 and p2."""
        (q1, q2) = self.demand_model.get_demand(p1, p2)
        
        profit1 = (p1 - self.c1) * q1
        profit2 = (p2 - self.c2) * q2
        return profit1, profit2

    @classmethod
    def from_params(cls, params: MarketParams) -> "MarketBenchmarks":
        return cls(
            demand_type=params.demand_type,
            demand_model=params.demand_model,
            cost=[params.marginal_cost_1, params.marginal_cost_2]
        )

if __name__ == "__main__":
    benchmarks = MarketBenchmarks(demand_type='linear', demand_model=LinearDemand(LinearDemandInputs(100.0, 3.0, 2.0)), cost=5.0)
    print("--- Theoretical Economic Benchmarks ---")
    for key, val in benchmarks.summary.items():
        print(f"{key}: {val}")