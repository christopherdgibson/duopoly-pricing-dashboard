import numpy as np
from environment import DuopolyPricingEnv
from agent import QLearningAgent
from benchmarks import MarketBenchmarks
from simulation import MarketSimulation

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

    env = DuopolyPricingEnv(a=demand_intercept, b=demand_slope, cost=[marginal_cost, marginal_cost])

    sim = MarketSimulation(
        env=env,
        agent1=QLearningAgent(n_prices=env.n_prices, alpha=alpha, epsilon=epsilon), 
        agent2=QLearningAgent(n_prices=env.n_prices, alpha=alpha, epsilon=epsilon), 
        benchmarks=MarketBenchmarks(a=demand_intercept, b=demand_slope, cost=marginal_cost),
        state=(0,0), all_p1=[], all_p2=[], all_r1=[], all_r2=[], trajectory=[]
    )

    simResults = []

    for ep in range(episodes):
        # Decay epsilon linearly from starting value down to 0.01
        current_epsilon = max(0.01, epsilon * (1 - ep / episodes))
        sim.agent1.epsilon = current_epsilon
        sim.agent2.epsilon = current_epsilon

        a1 = sim.agent1.select_action(sim.state)
        a2 = sim.agent2.select_action(sim.state)

        next_state, r1, r2 = sim.env.step(a1, a2)
        sim.agent1.update_q_value(sim.state, a1, r1, next_state)
        sim.agent2.update_q_value(sim.state, a2, r2, next_state)

        sim.state = next_state
        sim.all_p1.append(float(sim.env.prices[a1]))
        sim.all_p2.append(float(sim.env.prices[a2]))
        sim.all_r1.append(r1)
        sim.all_r2.append(r2)

        # Log rolling average trajectory window
        if (ep + 1) % window_size == 0:
            start = ep + 1 - window_size
            sim.trajectory.append({
                "episode": ep + 1,
                "avg_price1": float(np.mean(sim.all_p1[start:ep + 1])),
                "avg_price2": float(np.mean(sim.all_p2[start:ep + 1])),
                "avg_profit1": float(np.mean(sim.all_r1[start:ep + 1])),
                "avg_profit2": float(np.mean(sim.all_r2[start:ep + 1])),
            })

    # Ensure last_10_pct is at least 1 episode
    last_10_pct = max(1, int(episodes * 0.10))
    p1_mean = float(np.mean(sim.all_p1[-last_10_pct:]))
    p2_mean = float(np.mean(sim.all_p2[-last_10_pct:]))

    final_averages = {
        "final_avg_p1": p1_mean,
        "final_avg_p2": p2_mean,
        "final_avg_joint_price": round((p1_mean + p2_mean) / 2, 4),
        "final_avg_profit1": float(np.mean(sim.all_r1[-last_10_pct:])),
        "final_avg_profit2": float(np.mean(sim.all_r2[-last_10_pct:])),
    }

    simResults.append({
        "trajectory": sim.trajectory,
        "benchmarks": sim.benchmarks.summary(),
        "final_averages": final_averages
    })

    return simResults

def run_simulation_engine_asym(
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

    env_sym = DuopolyPricingEnv(a=demand_intercept, b=demand_slope, cost=[marginal_cost, marginal_cost])
    env_asym = DuopolyPricingEnv(a=demand_intercept, b=demand_slope, cost=[marginal_cost / 2, marginal_cost])

    simulation_sym = MarketSimulation(
        env=env_sym,
        agent1=QLearningAgent(n_prices=env_sym.n_prices, alpha=alpha, epsilon=epsilon), 
        agent2=QLearningAgent(n_prices=env_sym.n_prices, alpha=alpha, epsilon=epsilon), 
        benchmarks=MarketBenchmarks(a=demand_intercept, b=demand_slope, cost=marginal_cost),
        state=(0,0), all_p1=[], all_p2=[], all_r1=[], all_r2=[], trajectory=[]
    )

    simulation_asym = MarketSimulation(
            env=env_asym,
            agent1=QLearningAgent(n_prices=env_asym.n_prices, alpha=alpha, epsilon=epsilon), 
            agent2=QLearningAgent(n_prices=env_asym.n_prices, alpha=alpha, epsilon=epsilon), 
            benchmarks=MarketBenchmarks(a=demand_intercept, b=demand_slope, cost=marginal_cost),
            state=(0,0), all_p1=[], all_p2=[], all_r1=[], all_r2=[], trajectory=[]
        )

    simResults = []
    simList = [simulation_sym, simulation_asym]

    for ep in range(episodes):
        # Decay epsilon linearly from starting value down to 0.01
        current_epsilon = max(0.01, epsilon * (1 - ep / episodes))

        aRand1 = None
        aRand2 = None
        explore1 = simulation_sym.agent1.is_exploration(current_epsilon)
        explore2 = simulation_sym.agent2.is_exploration(current_epsilon)

        if explore1:
            aRand1 = int(np.random.choice(simulation_sym.agent1.n_prices))
        if explore2:
            aRand2 = int(np.random.choice(simulation_sym.agent2.n_prices))

        for sim in simList:
            
            sim.agent1.epsilon = current_epsilon
            sim.agent2.epsilon = current_epsilon

            # explore1 = sim.agent1.is_exploration()
            # explore2 = sim.agent2.is_exploration()

            a1 = aRand1
            a2 = aRand2

            if a1 is None:
                a1 = sim.agent1.select_action(sim.state, False)
            if a2 is None:
                a2 = sim.agent2.select_action(sim.state, False)

            next_state, r1, r2 = sim.env.step(a1, a2)
            sim.agent1.update_q_value(sim.state, a1, r1, next_state)
            sim.agent2.update_q_value(sim.state, a2, r2, next_state)

            sim.state = next_state
            sim.all_p1.append(float(sim.env.prices[a1]))
            sim.all_p2.append(float(sim.env.prices[a2]))
            sim.all_r1.append(r1)
            sim.all_r2.append(r2)

            # Log rolling average trajectory window
            if (ep + 1) % window_size == 0:
                start = ep + 1 - window_size
                sim.trajectory.append({
                    "episode": ep + 1,
                    "avg_price1": float(np.mean(sim.all_p1[start:ep + 1])),
                    "avg_price2": float(np.mean(sim.all_p2[start:ep + 1])),
                    "avg_profit1": float(np.mean(sim.all_r1[start:ep + 1])),
                    "avg_profit2": float(np.mean(sim.all_r2[start:ep + 1])),
                })

    # Ensure last_10_pct is at least 1 episode
    last_10_pct = max(1, int(episodes * 0.10))

    for sim in simList:
        p1_mean = float(np.mean(sim.all_p1[-last_10_pct:]))
        p2_mean = float(np.mean(sim.all_p2[-last_10_pct:]))

        final_averages = {
            "final_avg_p1": p1_mean,
            "final_avg_p2": p2_mean,
            "final_avg_joint_price": round((p1_mean + p2_mean) / 2, 4),
            "final_avg_profit1": float(np.mean(sim.all_r1[-last_10_pct:])),
            "final_avg_profit2": float(np.mean(sim.all_r2[-last_10_pct:])),
        }

        simResults.append({
            "trajectory": sim.trajectory,
            "benchmarks": sim.benchmarks.summary(),
            "final_averages": final_averages
        })

    return simResults