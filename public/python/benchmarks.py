from config import MarketParams
from dataclasses import dataclass

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
    def __init__(self, a: float, b: float, cost: list[float] | float):
        self.a = a
        self.b = b
        
        # Handle both single float and list/tuple inputs
        if isinstance(cost, (list, tuple)):
            self.c1, self.c2 = cost[0], cost[1]
        else:
            self.c1 = self.c2 = float(cost)

    @property
    def bertrand_prices(self) -> tuple[float, float]:
        """Asymmetric Bertrand-Nash equilibrium prices."""
        p1 = self.bertrand_price(self.c1, self.c2)
        p2 = self.bertrand_price(self.c2, self.c1)
        return p1, p2

    @property
    def monopoly_prices(self) -> tuple[float, float]:
        """Monopoly Maximizing Prices."""
        p1 = self.monopoly_price(self.c1)
        p2 = self.monopoly_price(self.c2)
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
        return (self.a/(2 + self.b))  + ((1 + self.b) * (2 * (1 + self.b) * ci + self.b * cj)/((2 + 3 * self.b) * (2 + self.b)))

    def monopoly_price(self, ci: float) -> float:
        """Cooperative / Monopoly Joint-Profit Maximizing Price."""
        return (self.a + ci) / 2.0

    def compute_profit(self, p1: float, p2: float) -> tuple[float, float]:
        """Calculates exact stage-game profits given arbitrary prices p1 and p2."""
        q1 = max(0.0, self.a - p1 + self.b * (p2 - p1))
        q2 = max(0.0, self.a - p2 + self.b * (p1 - p2))
        
        profit1 = (p1 - self.c1) * q1
        profit2 = (p2 - self.c2) * q2
        return profit1, profit2

    @classmethod
    def from_params(cls, params: MarketParams) -> "MarketBenchmarks":
        return cls(
            a=params.demand_intercept, 
            b=params.demand_slope, 
            cost=[params.marginal_cost_1, params.marginal_cost_2]
        )

if __name__ == "__main__":
    benchmarks = MarketBenchmarks(a=100.0, b=2.0, cost=5.0)
    print("--- Theoretical Economic Benchmarks ---")
    for key, val in benchmarks.summary().items():
        print(f"{key}: {val}")