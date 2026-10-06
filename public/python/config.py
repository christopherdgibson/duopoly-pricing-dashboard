from dataclasses import dataclass, fields
from typing import Union, Concatenate, Dict, Any

from demand import IDemandModel, LinearDemand, LogitDemand, LinearDemandInputs, LogitDemandInputs

# class DemandInputs: Union[LinearDemandInputs(), LogitDemandInputs()]

@dataclass(frozen=True)
class MarketParams:
    demand_type: str
    demand_model: IDemandModel
    marginal_cost_1: float
    marginal_cost_2: float
    alpha: float
    epsilon: float

    @classmethod
    def unpack_config(cls, config_dict: dict) -> "MarketParams":
        # Convert Pyodide JsProxy objects to native Python dicts
        if hasattr(config_dict, "to_py"):
            config_dict = config_dict.to_py()

        inputs_dict = config_dict.get("demand_inputs", {})
        if hasattr(inputs_dict, "to_py"):
            inputs_dict = inputs_dict.to_py()

        # Parse Demand Model based on 'market_demand' flag
        demand_type = config_dict.get("demand_type", "linear").lower()

        def instantiate_from_dict(cls, data: Dict[str, Any]):
            """
            Instantiates a dataclass using kwargs, filtering out any extra keys 
            not expected by the dataclass __init__.
            """
            valid_keys = {f.name for f in fields(cls)}
            filtered_data = {k: v for k, v in data.items() if k in valid_keys}
            return cls(**filtered_data)

        if demand_type == "linear":
            # Filter and unpack kwargs safely into LinearDemandInputs
            inputs = instantiate_from_dict(LinearDemandInputs, inputs_dict)
            model = LinearDemand(inputs)

        elif demand_type == "logit":
            # Filter and unpack kwargs safely into LogitDemandInputs
            inputs = instantiate_from_dict(LogitDemandInputs, inputs_dict)
            model = LogitDemand(inputs)

        else:
            raise ValueError(f"Unsupported demand model type: '{demand_type}'")

        return cls(
                demand_type=demand_type,
                demand_model=model,
                marginal_cost_1=float(config_dict["marginal_cost_1"]),
                marginal_cost_2=float(config_dict["marginal_cost_2"]),
                alpha=float(config_dict["alpha"]),
                epsilon=float(config_dict["epsilon"]),
            )

@dataclass(frozen=True)
class RunConfig:
    episodes: int
    window_size: int
    convergence: bool = False
    converge_threshold: int = 50
    decay_episodes: int = 5000

    @classmethod
    def from_params(cls, params) -> "RunConfig":
        planned_episodes = int(params.episodes)
        max_episodes = int(1E7)
        return cls(
            episodes=max_episodes if params.convergence else planned_episodes,
            decay_episodes=planned_episodes,      
            window_size=min(planned_episodes, int(params.window_size)),
            convergence=bool(params.convergence),
            converge_threshold=int(params.converge_threshold)
        )
            
@dataclass(frozen=True)
class SimulationConfig:
    market: MarketParams
    run: RunConfig