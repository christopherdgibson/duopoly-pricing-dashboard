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

    # Todo: Return Bertrand and Monopoly cost differentiated prices
    @property
    def bertrand_prices(self) -> tuple[float, float]:
        """Calculates asymmetric Bertrand-Nash equilibrium prices."""
        # For linear demand: p_i = (2*a + 2*b*c_i + b*c_j) / (3*b)
        p1 = (2 * self.a + 2 * self.b * self.c1 + self.b * self.c2) / (3 * self.b)
        p2 = (2 * self.a + 2 * self.b * self.c2 + self.b * self.c1) / (3 * self.b)
        return p1, p2
    
    @property
    def bertrand_price(self) -> float:
        """Non-cooperative Bertrand-Nash Equilibrium Price."""
        return (self.a + self.c1 * (1 + self.b)) / (2 + self.b)

    @property
    def monopoly_price(self) -> float:
        """Cooperative / Monopoly Joint-Profit Maximizing Price."""
        return (self.a + self.c1) / 2.0

    def compute_profit(self, p1: float, p2: float) -> tuple[float, float]:
        """Calculates exact stage-game profits given arbitrary prices p1 and p2."""
        q1 = max(0.0, self.a - p1 + self.b * (p2 - p1))
        q2 = max(0.0, self.a - p2 + self.b * (p1 - p2))
        
        profit1 = (p1 - self.c1) * q1
        profit2 = (p2 - self.c1) * q2
        return profit1, profit2

    def summary(self) -> dict:
        p_b = self.bertrand_price
        p_m = self.monopoly_price
        
        prof_b1, prof_b2 = self.compute_profit(p_b, p_b)
        prof_m1, prof_m2 = self.compute_profit(p_m, p_m)
        
        return {
            "marginal_cost": self.c1,
            "bertrand_price": round(p_b, 4),
            "bertrand_profit_per_firm": round(prof_b1, 4),
            "monopoly_price": round(p_m, 4),
            "monopoly_profit_per_firm": round(prof_m1, 4)
        }

if __name__ == "__main__":
    benchmarks = MarketBenchmarks(a=100.0, b=2.0, cost=5.0)
    print("--- Theoretical Economic Benchmarks ---")
    for key, val in benchmarks.summary().items():
        print(f"{key}: {val}")