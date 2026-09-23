import numpy as np
from simulation import MarketSimulation
from config import MarketParams, RunConfig, SimulationConfig

def run_simulation_engine(config_dict: dict):

    # Convert Pyodide JsProxy objects to native Python dicts
    if hasattr(config_dict, "to_py"):
        config_dict = config_dict.to_py()

    # Unpack JS dictionaries directly into dataclass constructors
    market_params = MarketParams(**config_dict["market"])
    run_inputs = RunConfig(**config_dict["run"])

    run_config = RunConfig.from_params(run_inputs)

    config = SimulationConfig(market=market_params, run=run_config)

    # 2. Use the factory method to instantiate the simulation instance
    sim = MarketSimulation.from_params(config.market)

    simResults = []

    for ep in range(config.run.episodes):
        # Decay epsilon linearly from starting value down to 0.01
        current_epsilon = max(0.01, config.market.epsilon * (1 - ep / config.run.decay_episodes))

        sim.agent1.epsilon = current_epsilon
        sim.agent2.epsilon = current_epsilon

        explore1 = sim.agent1.is_exploration(current_epsilon)
        explore2 = sim.agent2.is_exploration(current_epsilon)

        optimal_a1 = sim.agent1.optimal_action(sim.state)
        optimal_a2 = sim.agent2.optimal_action(sim.state)

        a1 = sim.agent1.random_action() if explore1 else optimal_a1
        a2 = sim.agent2.random_action() if explore2 else optimal_a2

        # Check streak before appending current action to history
        if len(sim.all_optimal_a1) > 0:
            sim.streak1 = sim.streak1 + 1 if optimal_a1 == sim.all_optimal_a1[-1] else 1

        if len(sim.all_optimal_a2) > 0:
            sim.streak2 = sim.streak2 + 1 if optimal_a2 == sim.all_optimal_a2[-1] else 1

        # Append current action after the streak check
        sim.all_optimal_a1.append(optimal_a1)
        sim.all_optimal_a2.append(optimal_a2)

        next_state, r1, r2 = sim.env.step(a1, a2)
        sim.agent1.update_q_value(sim.state, a1, r1, next_state)
        sim.agent2.update_q_value(sim.state, a2, r2, next_state)

        sim.state = next_state
        sim.all_p1.append(float(sim.env.prices[a1]))
        sim.all_p2.append(float(sim.env.prices[a2]))
        sim.all_r1.append(r1)
        sim.all_r2.append(r2)

        # Log rolling average trajectory window
        if (ep + 1) % config.run.window_size == 0:
            start = ep + 1 - config.run.window_size
            sim.trajectory.append({
                "episode": ep + 1,
                "avg_price1": float(np.mean(sim.all_p1[start:ep + 1])),
                "avg_price2": float(np.mean(sim.all_p2[start:ep + 1])),
                "avg_profit1": float(np.mean(sim.all_r1[start:ep + 1])),
                "avg_profit2": float(np.mean(sim.all_r2[start:ep + 1])),
                "avg_optimal_a1": float(np.mean(sim.all_optimal_a1[start:ep + 1])),
                "avg_optimal_a2": float(np.mean(sim.all_optimal_a2[start:ep + 1])),
            })

        # Early break if convergence selected
        if (
            config.run.convergence 
            and sim.streak1 >= config.run.converge_threshold 
            and sim.streak2 >= config.run.converge_threshold
        ):
            break

    # Determine total episodes actually executed
    actual_episodes = len(sim.all_p1)
    
    # Take the last 10% of actual completed steps (at least 1 step)
    last_10_pct = max(1, int(actual_episodes * 0.10))

    p1_mean = float(np.mean(sim.all_p1[-last_10_pct:]))
    p2_mean = float(np.mean(sim.all_p2[-last_10_pct:]))
    r1_mean = float(np.mean(sim.all_r1[-last_10_pct:]))
    r2_mean = float(np.mean(sim.all_r2[-last_10_pct:]))

    final_averages = {
        "final_avg_p1": round(p1_mean, 4),
        "final_avg_p2": round(p2_mean, 4),
        "final_avg_joint_price": round((p1_mean + p2_mean) / 2, 4),
        "final_avg_profit1": round(r1_mean, 4),
        "final_avg_profit2": round(r2_mean, 4),
        "final_streak1": sim.streak1,
        "final_streak2": sim.streak2,
        "episodes_to_converge": actual_episodes if run_config.convergence else None
    }

    simResults.append({
        "trajectory": sim.trajectory,
        "benchmarks": sim.benchmarks.summary(),
        "final_averages": final_averages
    })

    return simResults

# def run_simulation_engine_asym(
#     episodes: int,
#     window_size: int,
#     demand_intercept: float,
#     demand_slope: float,
#     marginal_cost: float,
#     alpha: float,
#     epsilon: float
# ):
#     episodes = int(episodes)
#     window_size = min(episodes, int(window_size))

#     env_sym = DuopolyPricingEnv(a=demand_intercept, b=demand_slope, cost=[marginal_cost, marginal_cost])
#     env_asym = DuopolyPricingEnv(a=demand_intercept, b=demand_slope, cost=[marginal_cost / 2, marginal_cost])

#     simulation_sym = MarketSimulation(
#         env=env_sym,
#         agent1=QLearningAgent(n_prices=env_sym.n_prices, alpha=alpha, epsilon=epsilon), 
#         agent2=QLearningAgent(n_prices=env_sym.n_prices, alpha=alpha, epsilon=epsilon), 
#         benchmarks=MarketBenchmarks(a=demand_intercept, b=demand_slope, cost=marginal_cost),
#         # Todo: New dataclass should make passing through empty parameters to avoid mutable default bug but to check
#         state=(0,0), all_p1=[], all_p2=[], all_r1=[], all_r2=[], all_optimal_a1=[], all_optimal_a2=[], streak1=1, streak2=1, trajectory=[]
#     )

#     simulation_asym = MarketSimulation(
#             env=env_asym,
#             agent1=QLearningAgent(n_prices=env_asym.n_prices, alpha=alpha, epsilon=epsilon), 
#             agent2=QLearningAgent(n_prices=env_asym.n_prices, alpha=alpha, epsilon=epsilon), 
#             benchmarks=MarketBenchmarks(a=demand_intercept, b=demand_slope, cost=marginal_cost),
#             state=(0,0), all_p1=[], all_p2=[], all_r1=[], all_r2=[], all_optimal_a1=[], all_optimal_a2=[], streak1=1, streak2=1, trajectory=[]
#         )

#     simResults = []
#     simList = [simulation_sym, simulation_asym]

#     for ep in range(episodes):
#         # Decay epsilon linearly from starting value down to 0.01
#         current_epsilon = max(0.01, epsilon * (1 - ep / episodes))

#         explore1 = simulation_sym.agent1.is_exploration(current_epsilon)
#         explore2 = simulation_sym.agent2.is_exploration(current_epsilon)

#         # Choose same random action for all simulations to normalise randomness
#         aRand1 = simulation_sym.agent1.random_action() if explore1 else None
#         aRand2 = simulation_sym.agent2.random_action() if explore2 else None

#         for sim in simList:
            
#             sim.agent1.epsilon = current_epsilon
#             sim.agent2.epsilon = current_epsilon

#             a1 = sim.agent1.optimal_action(sim.state) if aRand1 is None else aRand1
#             a2 = sim.agent2.optimal_action(sim.state) if aRand2 is None else aRand2

#             next_state, r1, r2 = sim.env.step(a1, a2)
#             sim.agent1.update_q_value(sim.state, a1, r1, next_state)
#             sim.agent2.update_q_value(sim.state, a2, r2, next_state)

#             sim.state = next_state
#             sim.all_p1.append(float(sim.env.prices[a1]))
#             sim.all_p2.append(float(sim.env.prices[a2]))
#             sim.all_r1.append(r1)
#             sim.all_r2.append(r2)

#             # Log rolling average trajectory window
#             if (ep + 1) % window_size == 0:
#                 start = ep + 1 - window_size
#                 sim.trajectory.append({
#                     "episode": ep + 1,
#                     "avg_price1": float(np.mean(sim.all_p1[start:ep + 1])),
#                     "avg_price2": float(np.mean(sim.all_p2[start:ep + 1])),
#                     "avg_profit1": float(np.mean(sim.all_r1[start:ep + 1])),
#                     "avg_profit2": float(np.mean(sim.all_r2[start:ep + 1])),
#                 })

#     # Determine total episodes actually executed
#     actual_episodes = len(sim.all_p1)
    
#     # Take the last 10% of ACTUAL completed steps (at least 1 step)
#     last_10_pct = max(1, int(actual_episodes * 0.10))

#     for sim in simList:
#         p1_mean = float(np.mean(sim.all_p1[-last_10_pct:]))
#         p2_mean = float(np.mean(sim.all_p2[-last_10_pct:]))
#         r1_mean = float(np.mean(sim.all_r1[-last_10_pct:]))
#         r2_mean = float(np.mean(sim.all_r2[-last_10_pct:]))

#         final_averages = {
#             "final_avg_p1": round(p1_mean, 4),
#             "final_avg_p2": round(p2_mean, 4),
#             "final_avg_joint_price": round((p1_mean + p2_mean) / 2, 4),
#             "final_avg_profit1": round(r1_mean, 4),
#             "final_avg_profit2": round(r2_mean, 4),
#         }

#         simResults.append({
#             "trajectory": sim.trajectory,
#             "benchmarks": sim.benchmarks.summary(),
#             "final_averages": final_averages
#         })

#     return simResults