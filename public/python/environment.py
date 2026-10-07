import numpy as np
from typing import Tuple

from demand import IDemandModel

class DuopolyPricingEnv:
    def __init__(self, demand_type: str, demand_model: IDemandModel, cost=[5, 5], price_grid=[10, 12, 14, 16, 18, 20]):
        self.prices = np.array(price_grid)
        self.n_prices = len(price_grid)
        self.demand_type=demand_type
        self.demand_model=demand_model
        self.cost = cost
        
    def step(self, action1_idx: int, action2_idx: int):
        p1 = self.prices[action1_idx]
        p2 = self.prices[action2_idx]

        q = self.demand_model.get_demand(p1, p2)
        q1 = q[0]
        q2 = q[1]
        
        profit1 = (p1 - self.cost[0]) * q1
        profit2 = (p2 - self.cost[1]) * q2
        
        next_state = (action1_idx, action2_idx)
        return next_state, profit1, profit2

    def generate_price_grid(
        demand: IDemandModel,
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

        pm = demand.monopoly_prices(c1, c2)
        p_max = max(pm)
        
        # Define bounds based on market economics
        p_min = min_cost * 0.8 if allow_sub_cost else min_cost
        # p_max = (a + max_cost) / 2.0  # Max monopoly price
        
        # Generate N evenly spaced prices rounded to 2 decimal places
        return np.round(np.linspace(p_min, p_max, n_prices), 2)

    def generate_price_grids(
        demand: IDemandModel,
        c1: float,
        c2: float,
        n_prices: int = 15,
        allow_sub_cost: bool = False,
        buffer_factor: float = 0.15
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generates model-agnostic 1D price grids for Firm 1 and Firm 2.
        
        Ensures that both Bertrand-Nash and Joint Monopoly equilibrium prices 
        fall comfortably within the grid interior.
        """
        # 1. Fetch benchmark prices polymorphically
        p_bert1, p_bert2 = demand.bertrand_prices(c1, c2)
        p_mono1, p_mono2 = demand.monopoly_prices(c1, c2)
        
        # 2. Determine lower bounds per firm
        p1_min = c1 * 0.8 if allow_sub_cost else c1
        p2_min = c2 * 0.8 if allow_sub_cost else c2
        
        # 3. Determine upper bounds (monopoly price + small buffer for visual padding)
        # Ensure upper bound is at least higher than Bertrand price
        max_target_1 = max(p_mono1, p_bert1)
        max_target_2 = max(p_mono2, p_bert2)
        
        p1_max = max_target_1 + buffer_factor * (max_target_1 - c1)
        p2_max = max_target_2 + buffer_factor * (max_target_2 - c2)
        
        # 4. Generate 1D price arrays
        grid1 = np.round(np.linspace(p1_min, p1_max, n_prices), 2)
        grid2 = np.round(np.linspace(p2_min, p2_max, n_prices), 2)
        
        return grid1, grid2