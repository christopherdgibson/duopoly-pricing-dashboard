import numpy as np
from environment import DuopolyPricingEnv
from agent import QLearningAgent
from benchmarks import MarketBenchmarks

def run_simulation_engine(episodes, a, b, cost, window_size):
    env = DuopolyPricingEnv(a=a, b=b, cost=cost)
    agent1 = QLearningAgent(env.n_prices)
    agent2 = QLearningAgent(env.n_prices)
    benchmarks = MarketBenchmarks(a=a, b=b, cost=cost)

    state = (0, 0)
    all_p1, all_p2 = [], []
    all_r1, all_r2 = [], []
    trajectory = []

    for ep in range(int(episodes)):
        epsilon = max(0.01, 0.2 * (1 - ep / episodes))
        agent1.epsilon = epsilon
        agent2.epsilon = epsilon

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

        if (ep + 1) % int(window_size) == 0:
            start = ep + 1 - int(window_size)
            trajectory.append({
                "episode": ep + 1,
                "avg_price1": float(np.mean(all_p1[start:ep + 1])),
                "avg_price2": float(np.mean(all_p2[start:ep + 1])),
                "avg_profit1": float(np.mean(all_r1[start:ep + 1])),
                "avg_profit2": float(np.mean(all_r2[start:ep + 1])),
            })

    last_10_pct = int(episodes * 0.10)
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