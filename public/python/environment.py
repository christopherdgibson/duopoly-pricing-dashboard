import numpy as np

class DuopolyPricingEnv:
    def __init__(self, a=100, b=2, cost=[5, 5], price_grid=[10, 12, 14, 16, 18, 20]):
        self.prices = np.array(price_grid)
        self.n_prices = len(price_grid)
        self.a = a
        self.b = b
        self.cost = cost
        
    def step(self, action1_idx: int, action2_idx: int):
        p1 = self.prices[action1_idx]
        p2 = self.prices[action2_idx]
        
        # Linear demand system
        q1 = max(0, self.a - p1 + self.b * (p2 - p1))
        q2 = max(0, self.a - p2 + self.b * (p1 - p2))
        
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