import numpy as np

class QLearningAgent:
    def __init__(self, n_prices: int, alpha: float = 0.1, gamma: float = 0.95, epsilon: float = 0.2):
        self.n_prices = n_prices
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        
        # State: (previous_price_p1, previous_price_p2), Action: my_price
        self.q_table = np.zeros((n_prices, n_prices, n_prices))

    def is_exploration(self, epsilon: float) -> bool:
        return np.random.rand() < epsilon

    def select_action(self, state: tuple, explore: bool | None = None) -> int:
        if explore is None:
            explore = self.is_exploration(self.epsilon)
        if explore:
            return int(np.random.choice(self.n_prices))
        p1_idx, p2_idx = state
        return int(np.argmax(self.q_table[p1_idx, p2_idx]))

    def update_q_value(self, state: tuple, action_idx: int, reward: float, next_state: tuple):
        p1_idx, p2_idx = state
        next_p1, next_p2 = next_state
        
        best_future_q = np.max(self.q_table[next_p1, next_p2])
        current_q = self.q_table[p1_idx, p2_idx, action_idx]
        
        new_q = current_q + self.alpha * (reward + self.gamma * best_future_q - current_q)
        self.q_table[p1_idx, p2_idx, action_idx] = new_q