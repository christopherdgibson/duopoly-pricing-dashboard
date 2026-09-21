import numpy as np

class DuopolyPricingEnv:
    def __init__(self, price_grid=[10, 12, 14, 16, 18, 20], a=100, b=2, cost=[5, 5]):
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