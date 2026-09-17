from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from core.environment import DuopolyPricingEnv
from core.agent import QLearningAgent

app = FastAPI(title="Algorithmic Collusion Simulator")

class SimulationConfig(BaseModel):
    episodes: int = 10000
    demand_intercept: float = 100.0
    cross_price_elasticity: float = 2.0
    marginal_cost: float = 5.0
    window_size: int = 100  # Size of rolling average window

@app.post("/api/run-simulation")
def run_simulation(config: SimulationConfig):
    env = DuopolyPricingEnv(
        a=config.demand_intercept, 
        b=config.cross_price_elasticity, 
        cost=config.marginal_cost
    )
    
    agent1 = QLearningAgent(env.n_prices)
    agent2 = QLearningAgent(env.n_prices)
    
    state = (0, 0)
    
    # Store history of all rounds to compute windowed metrics
    all_p1 = []
    all_p2 = []
    all_r1 = []
    all_r2 = []
    
    trajectory = []

    for ep in range(config.episodes):
        # Decay exploration rate gradually so agents converge to learned preferences
        epsilon = max(0.01, 0.2 * (1 - ep / config.episodes))
        agent1.epsilon = epsilon
        agent2.epsilon = epsilon

        a1 = agent1.select_action(state)
        a2 = agent2.select_action(state)
        
        next_state, r1, r2 = env.step(a1, a2)
        
        agent1.update_q_value(state, a1, r1, next_state)
        agent2.update_q_value(state, a2, r2, next_state)
        
        state = next_state
        
        p1 = float(env.prices[a1])
        p2 = float(env.prices[a2])
        
        all_p1.append(p1)
        all_p2.append(p2)
        all_r1.append(r1)
        all_r2.append(r2)
        
        # Calculate block-average metrics every window_size episodes
        if (ep + 1) % config.window_size == 0:
            window_start = ep + 1 - config.window_size
            trajectory.append({
                "episode": ep + 1,
                "avg_price1": float(np.mean(all_p1[window_start:ep + 1])),
                "avg_price2": float(np.mean(all_p2[window_start:ep + 1])),
                "avg_profit1": float(np.mean(all_r1[window_start:ep + 1])),
                "avg_profit2": float(np.mean(all_r2[window_start:ep + 1])),
            })

    # Long-run summary: Average over the final 10% of total episodes
    last_10_percent = int(config.episodes * 0.10)
    
    summary = {
        "marginal_cost": config.marginal_cost,
        "final_avg_price_firm1": float(np.mean(all_p1[-last_10_percent:])),
        "final_avg_price_firm2": float(np.mean(all_p2[-last_10_percent:])),
        "final_avg_joint_price": float(np.mean(all_p1[-last_10_percent:] + all_p2[-last_10_percent:]) / 2),
        "final_avg_profit_firm1": float(np.mean(all_r1[-last_10_percent:])),
        "final_avg_profit_firm2": float(np.mean(all_r2[-last_10_percent:])),
    }

    return {
        "status": "success",
        "summary": summary,
        "trajectory": trajectory
    }