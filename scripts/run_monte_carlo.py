import sys
import json
import os
import numpy as np
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
import multiprocessing
import time

project_root = Path(__file__).resolve().parent.parent
public_python_dir = project_root / "public" / "python"
public_python_utils = public_python_dir / "utils"

# Add the directory to sys.path if it isn't already there
if str(public_python_dir) not in sys.path:
    sys.path.append(str(public_python_dir))

if str(public_python_utils) not in sys.path:
    sys.path.append(str(public_python_utils))

from main import run_simulation_engine
from stopwatch import Stopwatch

def evaluate_single_cell(args):
    """
    Worker function to process a single (c1, c2) cell in parallel across CPU cores.
    """
    i, j, c1, c2, monte_carlo_runs = args
    run_prices = []

    planned_episodes = 5000
    
    max_episodes: int = int(5E+5)

    payload = {
        "market": {
            "demand_intercept": 100,
            "demand_slope": 2,
            "marginal_cost_1": c1,
            "marginal_cost_2": c2,
            "alpha": 0.1,
            "epsilon": 0.2
        },
        "run": {
            "episodes": max_episodes,
            "decay_episodes": planned_episodes,      
            "window_size": min(planned_episodes, 100),
            "convergence": True,
            "converge_threshold": 50
        }
    }

    timer = Stopwatch()
    for mc_seed in range(monte_carlo_runs):
        np.random.seed(mc_seed)
        
        results = run_simulation_engine(payload, include_trajectory=False)
        final_price = results[0]["final_averages"]["final_avg_joint_price"]
        run_prices.append(final_price)

        timer.split()
        timer.total()

        print('Run:', mc_seed + 1, '/', monte_carlo_runs, ', c1:', c1, ', c2:', c2, ', final_avg_p1:', results[0]["final_averages"]["final_avg_p1"], ', final_avg_p2:', results[0]["final_averages"]["final_avg_p2"], 'episodes_to_converge', results[0]["final_averages"]["episodes_to_converge"])
        print('episode_limit:', max_episodes)
    price_mean = round(float(np.mean(run_prices)), 4)
    print(f"COMPLETED c1: {c1}, c2: {c2} across {monte_carlo_runs} runs.")
    return (i, j, {"c1": c1, "c2": c2, "price_mean": price_mean})


def run_parameter_sweep_parallel(
    cost_1_range: list[float],
    cost_2_range: list[float],
    monte_carlo_runs: int
):
    """
    Executes parameter sweep using ProcessPoolExecutor across all CPU cores.
    """
    # Prepare task grid
    tasks = []
    for i, c1 in enumerate(cost_1_range):
        for j, c2 in enumerate(cost_2_range):
            tasks.append((i, j, c1, c2, monte_carlo_runs))

    num_workers = multiprocessing.cpu_count()
    print(f"Starting parameter sweep with {len(tasks)} cells using {num_workers} CPU cores...")

    results_matrix = [[None for _ in cost_2_range] for _ in cost_1_range]

    # Run tasks across all CPU cores
    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        futures = [executor.submit(evaluate_single_cell, task) for task in tasks]
        for future in as_completed(futures):
            i, j, result = future.result()
            results_matrix[i][j] = result

    # Flatten results into list
    resultsOut = [cell for row in results_matrix for cell in row]
    return resultsOut


if __name__ == "__main__":
    results = run_parameter_sweep_parallel(
        cost_1_range=[5, 12, 25],
        cost_2_range=[5, 12, 25],
        monte_carlo_runs=10
    )

    # Export into React project's public directory
    output_dir = os.path.join("public", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "monte_carlo_results.json")

    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"Successfully saved simulation output to {output_path}")
