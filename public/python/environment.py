from dataclasses import dataclass
import numpy as np

class DuopolyPricingEnv:
    def __init__(self, demand_intercept=100, demand_slope=3, elasticity_ij=2, cost=[5, 5], price_grid=[10, 12, 14, 16, 18, 20]):
        self.prices = np.array(price_grid)
        self.n_prices = len(price_grid)
        self.demand_intercept = demand_intercept
        self.demand_slope = demand_slope
        self.elasticity_ij = elasticity_ij
        self.cost = cost
        
    def step(self, action1_idx: int, action2_idx: int):
        p1 = self.prices[action1_idx]
        p2 = self.prices[action2_idx]

        demand = LinearDemand(
            demand_intercept = self.demand_intercept,
            demand_slope = self.demand_slope,
            elasticity_ij = self.elasticity_ij,
            p1 = p1,
            p2 = p2
        )

        (q1, q2) = demand.get_demand()
        
        # Linear demand system
        # q1 = max(0, self.demand_intercept - p1 + self.demand_slope * (p2 - p1))
        # q2 = max(0, self.demand_intercept - p2 + self.demand_slope * (p1 - p2))
        
        profit1 = (p1 - self.cost[0]) * q1
        profit2 = (p2 - self.cost[1]) * q2
        
        next_state = (action1_idx, action2_idx)
        return next_state, profit1, profit2

    def generate_price_grid(
        a: float, 
        c1: float, 
        c2: float, 
        n_prices: int, 
        allow_sub_cost: bool
    ) -> np.ndarray:
        """
        Dynamically constructs a discrete price action space spanning from
        the lowest relevant cost up to the Monopoly price.
        """
        min_cost = min(c1, c2)
        max_cost = max(c1, c2)
        
        # Define bounds based on market economics
        p_min = min_cost * 0.8 if allow_sub_cost else min_cost
        p_max = (a + max_cost) / 2.0  # Max monopoly price
        
        # Generate N evenly spaced prices rounded to 2 decimal places
        return np.round(np.linspace(p_min, p_max, n_prices), 2)


@dataclass(frozen=True)
class LinearDemand:
    demand_intercept: float
    demand_slope: float
    elasticity_ij: float
    p1: float = None
    p2: float = None

    def get_demand(self) -> tuple[float, float]:
        q1 = max(0, self.demand_intercept - self.demand_slope * self.p1 + self.elasticity_ij * self.p2)
        q2 = max(0, self.demand_intercept - self.demand_slope * self.p2 + self.elasticity_ij * self.p1)

        return (q1, q2)

    def bertrand_equilibrium(self, c1: float, c2: float) -> np.ndarray:
            """Solves the Bertrand equilibrium via direct matrix inversion (O(N^3))."""
            # Matrix A (Coefficient matrix for FOCs)
            A = np.array([
                [2 * self.demand_slope, -self.elasticity_ij],
                [-self.elasticity_ij, 2 * self.demand_slope]
            ])
            
            # Vector B (Constants from demand baseline and marginal costs)
            B = np.array([
                self.demand_intercept + self.demand_slope * c1,
                self.demand_intercept + self.demand_slope * c2
            ])
            
            p_eq = np.linalg.solve(A, B)
            return p_eq
    
    def monopoly_equilibrium(self, c1: float, c2: float) -> np.ndarray:
        """Solves Joint-Profit Maximization (Monopoly Post-Merger)."""
        A = np.array([
            [2 * self.demand_slope, -2 * self.elasticity_ij],
            [-2 * self.elasticity_ij, 2 * self.demand_slope]
        ])
        B = np.array([
            self.demand_intercept + self.demand_slope * c1 - self.elasticity_ij * c2,
            self.demand_intercept + self.demand_slope * c2 - self.elasticity_ij * c1
        ])
        return np.linalg.solve(A, B)

if __name__ == "__main__":
    demand = LinearDemand(
        demand_intercept = 100,
        demand_slope = 3,
        elasticity_ij = 2
    )

    pb = demand.bertrand_equilibrium(5, 5)
    pm = demand.monopoly_equilibrium(5, 5)
    print('bertrand', pb)
    print('monopoly', pm)