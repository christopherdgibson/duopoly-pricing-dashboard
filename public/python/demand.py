import numpy as np
from dataclasses import dataclass
from typing import Tuple, Protocol

@dataclass(frozen=True)
class LinearDemandInputs:
    demand_intercept: float
    demand_slope: float
    elasticity_ij: float

@dataclass(frozen=True)
class LogitDemandInputs:
    v1: float
    v2: float
    alpha: float
    mu: float = 1.0

# DemandInputTypes = Union[LinearDemandInputs, LogitDemandInputs]

class IDemandModel(Protocol):
    def get_demand(self, p1: float, p2: float) -> Tuple[float, float]:
        """Returns demand quantities (q1, q2) given prices p1 and p2."""
        ...

    def bertrand_prices(self) -> Tuple[float, float]:
        """Calculates Bertrand-Nash equilibrium prices (pb1*, pb2*)."""
        ...

    def monopoly_prices(self) -> Tuple[float, float]:
        """Calculates joint profit-maximizing monopoly prices (pm1*, pm2*)."""
        ...

@dataclass(frozen=True)
class LinearDemand:
    inputs: LinearDemandInputs

    def get_demand(self, p1: float, p2: float) -> tuple[float, float]:
        q1 = max(0, self.inputs.demand_intercept - self.inputs.demand_slope * p1 + self.inputs.elasticity_ij * p2)
        q2 = max(0, self.inputs.demand_intercept - self.inputs.demand_slope * p2 + self.inputs.elasticity_ij * p1)

        return (q1, q2)

    def bertrand_prices(self, c1: float, c2: float) -> np.ndarray:
            """Solves the Bertrand equilibrium via direct matrix inversion (O(N^3))."""
            # Matrix A (Coefficient matrix for FOCs)
            A = np.array([
                [2 * self.inputs.demand_slope, -self.inputs.elasticity_ij],
                [-self.inputs.elasticity_ij, 2 * self.inputs.demand_slope]
            ])
            
            # Vector B (Constants from demand baseline and marginal costs)
            B = np.array([
                self.inputs.demand_intercept + self.inputs.demand_slope * c1,
                self.inputs.demand_intercept + self.inputs.demand_slope * c2
            ])
            
            p_eq = np.linalg.solve(A, B)
            return p_eq
    
    def monopoly_prices(self, c1: float, c2: float) -> np.ndarray:
        """Solves Joint-Profit Maximization (Monopoly Post-Merger)."""
        A = np.array([
            [2 * self.inputs.demand_slope, -2 * self.inputs.elasticity_ij],
            [-2 * self.inputs.elasticity_ij, 2 * self.inputs.demand_slope]
        ])
        B = np.array([
            self.inputs.demand_intercept + self.inputs.demand_slope * c1 - self.inputs.elasticity_ij * c2,
            self.inputs.demand_intercept + self.inputs.demand_slope * c2 - self.inputs.elasticity_ij * c1
        ])
        return np.linalg.solve(A, B)

if __name__ == "__main__":
    demand = LinearDemand(LinearDemandInputs(100, 3, 2))

    pb = demand.bertrand_prices(5, 5)
    pm = demand.monopoly_prices(5, 5)
    print('bertrand', pb)
    print('monopoly', pm)

@dataclass(frozen=True)
class LogitDemand:
    inputs: LogitDemandInputs
