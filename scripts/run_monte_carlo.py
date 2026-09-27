import sys
import json
import os
import numpy as np
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
public_python_dir = project_root / "public" / "python"

# Add the directory to sys.path if it isn't already there
if str(public_python_dir) not in sys.path:
    sys.path.append(str(public_python_dir))

from main import run_simulation_engine

def run_parameter_sweep(
    cost_1_range: list[float],
    cost_2_range: list[float],
    monte_carlo_runs: int
):
    """
    Executes a 2D parameter grid sweep over Monte Carlo seeds in Python.
    Returns a matrix of mean final joint prices for heatmap rendering.
    """
    grid_matrix = np.zeros((len(cost_1_range), len(cost_2_range)))
    resultsOut = []

    for i, c1 in enumerate(cost_1_range):
        for j, c2 in enumerate(cost_2_range):
            run_prices = []

            planned_episodes = 5000

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
                    "episodes": int(1E+7),
                    "decay_episodes": planned_episodes,      
                    "window_size": min(planned_episodes, int(100)),
                    "convergence": bool(True),
                    "converge_threshold": int(50)
                }
            }
            
            # Execute N Monte Carlo runs for this specific parameter pair (c1, c2)
            for mc_seed in range(monte_carlo_runs):
                # Optional seed for reproducible MC runs:
                np.random.seed(mc_seed)
                
                # Run engine with current grid parameters
                results = run_simulation_engine(payload, False)
                
                # Extract the final joint price from this run
                final_price = results[0]["final_averages"]["final_avg_joint_price"]
                run_prices.append(final_price)
                print('Run:', mc_seed + 1, '/', monte_carlo_runs, ', c1:', c1, ', c2:', c2, )
            
            # Record the mean outcome across all Monte Carlo runs for cell (i, j)
            price_mean = round(float(np.mean(run_prices)), 4)
            grid_matrix[i, j] = price_mean
            resultsOut.append({"c1": c1, "c2": c2, "price_mean": price_mean})

            print('Completed all', monte_carlo_runs, 'run(s) with parameters c1:', c1, ', c2:', c2)

    return resultsOut

if __name__ == "__main__":
    results = run_parameter_sweep(cost_1_range=[5, 6, 7], cost_2_range=[5, 6, 7], monte_carlo_runs=1000)

    # Export directly into your React project's public directory
    output_dir = os.path.join("public", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "monte_carlo_results.json")

    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"Successfully saved simulation output to {output_path}")

