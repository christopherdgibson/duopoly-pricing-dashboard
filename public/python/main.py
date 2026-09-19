import numpy as np
from environment import DuopolyPricingEnv
from agent import QLearningAgent
from benchmarks import MarketBenchmarks

def run_simulation_engine(
    episodes: int,
    window_size: int,
    demand_intercept: float,
    demand_slope: float,
    marginal_cost: float,
    alpha: float,
    epsilon: float
):
    episodes = int(episodes)
    window_size = min(episodes, int(window_size))

    env = DuopolyPricingEnv(a=demand_intercept, b=demand_slope, cost=marginal_cost)
    agent1 = QLearningAgent(n_prices=env.n_prices, alpha=alpha, epsilon=epsilon)
    agent2 = QLearningAgent(n_prices=env.n_prices, alpha=alpha, epsilon=epsilon)
    benchmarks = MarketBenchmarks(a=demand_intercept, b=demand_slope, cost=marginal_cost)

    state = (0, 0)
    all_p1, all_p2 = [], []
    all_r1, all_r2 = [], []
    trajectory = []

    for ep in range(episodes):
        # Decay epsilon linearly from starting value down to 0.01
        current_epsilon = max(0.01, epsilon * (1 - ep / episodes))
        agent1.epsilon = current_epsilon
        agent2.epsilon = current_epsilon

        a1 = agent1.select_action(state)
        a2 = agent2.select_action(state)

        next_state, r1, r2 = env.step(a1, a2)
        agent1.update_q_value(state, a1, r1, next_state)
        agent2.update_q_value(state, a2, r2, next_state)

        state = next_state
        all_p1.append(float(env.prices[a1]))
        all_p2.append(float(env.prices[a2]))
        all_r1.append(r1)
        all_r2.append(r2)

        # Log rolling average trajectory window
        if (ep + 1) % window_size == 0:
            start = ep + 1 - window_size
            trajectory.append({
                "episode": ep + 1,
                "avg_price1": float(np.mean(all_p1[start:ep + 1])),
                "avg_price2": float(np.mean(all_p2[start:ep + 1])),
                "avg_profit1": float(np.mean(all_r1[start:ep + 1])),
                "avg_profit2": float(np.mean(all_r2[start:ep + 1])),
            })

    # Ensure last_10_pct is at least 1 episode
    last_10_pct = max(1, int(episodes * 0.10))
    p1_mean = float(np.mean(all_p1[-last_10_pct:]))
    p2_mean = float(np.mean(all_p2[-last_10_pct:]))

    final_averages = {
        "final_avg_p1": p1_mean,
        "final_avg_p2": p2_mean,
        "final_avg_joint_price": round((p1_mean + p2_mean) / 2, 4),
        "final_avg_profit1": float(np.mean(all_r1[-last_10_pct:])),
        "final_avg_profit2": float(np.mean(all_r2[-last_10_pct:])),
    }

    return {
        "trajectory": trajectory,
        "benchmarks": benchmarks.summary(),
        "final_averages": final_averages
    }