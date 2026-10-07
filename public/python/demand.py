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
    quality_1: float
    quality_2: float
    price_sensitivity: float
    logit_scale: float = 1.0
    outside_utility: float = 0.0  # Default v0 = 0 -> exp(v0) = 1.0

@dataclass(frozen=True)
class LogitResults:
    converged: bool
    prices: Tuple[float, float]
    shares: Tuple[float, float]
    profits: Tuple[float, float] | float
    iterations: int
    residual_norm: float

# DemandInputTypes = Union[LinearDemandInputs, LogitDemandInputs]

class IDemandModel(Protocol):
    def get_demand(self, p1: float, p2: float) -> Tuple[float, float]:
        """Returns demand quantities (q1, q2) given prices p1 and p2."""
        ...

    def bertrand_prices(self, c1: float, c2: float) -> Tuple[float, float]:
        """Calculates Bertrand-Nash equilibrium prices (pb1*, pb2*)."""
        ...

    def monopoly_prices(self, c1: float, c2: float) -> Tuple[float, float]:
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

# if __name__ == "__main__":
#     demand = LinearDemand(LinearDemandInputs(100, 3, 2))

#     pb = demand.bertrand_prices(5, 5)
#     pm = demand.monopoly_prices(5, 5)
#     print('bertrand', pb)
#     print('monopoly', pm)

@dataclass(frozen=True)
class LogitDemand:
    inputs: LogitDemandInputs

    def get_demand(self, p1: float, p2: float) -> Tuple[float, float]:
        """Computes Logit market shares for Firm 1 and Firm 2 given current prices."""
        u0 = self.inputs.outside_utility / self.inputs.logit_scale
        u1 = (self.inputs.quality_1 - self.inputs.price_sensitivity * p1) / self.inputs.logit_scale
        u2 = (self.inputs.quality_2 - self.inputs.price_sensitivity * p2) / self.inputs.logit_scale
        
        # Exponentiate with numerical stability adjustment
        max_u = max(u0, u1, u2)
        exp0 = np.exp(u0 - max_u)
        exp1 = np.exp(u1 - max_u)
        exp2 = np.exp(u2 - max_u)
        
        denom = exp0 + exp1 + exp2
        return exp1 / denom, exp2 / denom, exp0 / denom

    def bertrand_prices(self, c1: float, c2: float) -> np.ndarray:
        results = self.solve_logit_bertrand(c1, c2)

        return results.prices

    def monopoly_prices(self, c1: float, c2: float) -> np.ndarray:
        results = self.solve_logit_monopoly(c1, c2)

        return results.prices

    def logit_bertrand_foc(
        self,
        p: np.ndarray, 
        c1: float, 
        c2: float, 
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Computes the FOC residual vector F(p) and Jacobian matrix J(p).
        F_i = 1 - (p_i - c_i) * (self.inputs.price_sensitivity / self.inputs.logit_scale) * (1 - q_i) = 0
        """
        p1, p2 = p[0], p[1]
        q1, q2, q0 = self.get_demand(p1, p2)
        
        # FOC residuals (divided by q_i for numerical stability)
        f1 = 1.0 - (p1 - c1) * (self.inputs.price_sensitivity / self.inputs.logit_scale) * (1.0 - q1)
        f2 = 1.0 - (p2 - c2) * (self.inputs.price_sensitivity / self.inputs.logit_scale) * (1.0 - q2)
        F = np.array([f1, f2], dtype=float)
        
        # Partial derivatives of shares with respect to prices
        # dq_i / dp_i = -(self.inputs.price_sensitivity / self.inputs.logit_scale) * q_i * (1 - q_i)
        # dq_i / dp_j =  (self.inputs.price_sensitivity / self.inputs.logit_scale) * q_i * q_j
        dq1_dp1 = -(self.inputs.price_sensitivity / self.inputs.logit_scale) * q1 * (1.0 - q1)
        dq1_dp2 =  (self.inputs.price_sensitivity / self.inputs.logit_scale) * q1 * q2
        dq2_dp1 =  (self.inputs.price_sensitivity / self.inputs.logit_scale) * q2 * q1
        dq2_dp2 = -(self.inputs.price_sensitivity / self.inputs.logit_scale) * q2 * (1.0 - q2)
        
        # Elements of the Jacobian J_ij = dF_i / dp_j
        j11 = -(self.inputs.price_sensitivity / self.inputs.logit_scale) * (1.0 - q1) + (p1 - c1) * (self.inputs.price_sensitivity / self.inputs.logit_scale) * dq1_dp1
        j12 = (p1 - c1) * (self.inputs.price_sensitivity / self.inputs.logit_scale) * dq1_dp2
        j21 = (p2 - c2) * (self.inputs.price_sensitivity / self.inputs.logit_scale) * dq2_dp1
        j22 = -(self.inputs.price_sensitivity / self.inputs.logit_scale) * (1.0 - q2) + (p2 - c2) * (self.inputs.price_sensitivity / self.inputs.logit_scale) * dq2_dp2
        
        J = np.array([[j11, j12], [j21, j22]], dtype=float)
        return F, J

    def solve_logit_bertrand(
        self,
        c1: float, 
        c2: float, 
        tol: float = 1e-8, 
        max_iter: int = 100
    ) -> LogitResults:
        """
        Solves for Bertrand-Nash equilibrium prices under Logit demand using Newton-Raphson.
        """
        # Initial guess: Marginal cost + standard unit markup
        p = np.array([c1 + 1.0 / self.inputs.price_sensitivity, c2 + 1.0 / self.inputs.price_sensitivity], dtype=float)
        
        for iteration in range(max_iter):
            F, J = self.logit_bertrand_foc(p, c1, c2)
            
            # Check convergence norm
            norm = np.linalg.norm(F, ord=2)
            if norm < tol:
                q1, q2, q0 = self.get_demand(p[0], p[1])
                profits = (float((p[0] - c1) * q1), float((p[1] - c2) * q2))
                results = LogitResults(
                    converged = True,
                    prices = (float(p[0]), float(p[1])),
                    shares = (float(q1), float(q2)),
                    profits = profits,
                    iterations = iteration,
                    residual_norm = float(norm)
                )

                return results
            
            # Newton-Raphson step: p_{k+1} = p_k - J^{-1} * F
            try:
                delta = np.linalg.solve(J, F)
            except np.linalg.LinAlgError:
                raise RuntimeError("Jacobian matrix became singular during Newton-Raphson iterations.")
                
            p = p - delta

        raise TimeoutError(f"Newton-Raphson solver failed to converge within {max_iter} iterations.")

    def solve_logit_monopoly(
        self,
        c1: float, 
        c2: float, 
        tol: float = 1e-8, 
        max_iter: int = 100
    ) -> LogitResults:
        """Solves for joint profit-maximizing monopoly prices under Logit demand."""
        # Start guess at marginal cost + markup
        p = np.array([c1 + 2.0 / self.inputs.price_sensitivity, c2 + 2.0 / self.inputs.price_sensitivity], dtype=float)

        for iteration in range(max_iter):
            p1, p2 = p[0], p[1]
            q1, q2, q0 = self.get_demand(p1, p2)

            # FOC Residuals: F_i = 1 - (self.inputs.price_sensitivity/self.inputs.logit_scale) * q0 * (p_i - c_i)
            f1 = 1.0 - (self.inputs.price_sensitivity / self.inputs.logit_scale) * q0 * (p1 - c1)
            f2 = 1.0 - (self.inputs.price_sensitivity / self.inputs.logit_scale) * q0 * (p2 - c2)
            F = np.array([f1, f2], dtype=float)

            norm = np.linalg.norm(F, ord=2)
            if norm < tol:
                profit = float((p1 - c1) * q1 + (p2 - c2) * q2)
                results = LogitResults(
                    converged = True,
                    prices = (float(p[0]), float(p[1])),
                    shares = (float(q1), float(q2)),
                    profits = profit,
                    iterations = iteration,
                    residual_norm = float(norm)
                )

                return results

            # Jacobian J_ij = dF_i / dp_j
            # dq0 / dp_i = (self.inputs.price_sensitivity / self.inputs.logit_scale) * q0 * q_i
            dq0_dp1 = (self.inputs.price_sensitivity / self.inputs.logit_scale) * q0 * q1
            dq0_dp2 = (self.inputs.price_sensitivity / self.inputs.logit_scale) * q0 * q2

            j11 = -(self.inputs.price_sensitivity / self.inputs.logit_scale) * q0 - (self.inputs.price_sensitivity / self.inputs.logit_scale) * (p1 - c1) * dq0_dp1
            j12 = -(self.inputs.price_sensitivity / self.inputs.logit_scale) * (p1 - c1) * dq0_dp2
            j21 = -(self.inputs.price_sensitivity / self.inputs.logit_scale) * (p2 - c2) * dq0_dp1
            j22 = -(self.inputs.price_sensitivity / self.inputs.logit_scale) * q0 - (p2 - c2) * (self.inputs.price_sensitivity / self.inputs.logit_scale) * dq0_dp2

            J = np.array([[j11, j12], [j21, j22]], dtype=float)

            # Newton Step
            p = p - np.linalg.solve(J, F)

        raise TimeoutError("Monopoly solver failed to converge.")

if __name__ == "__main__":
    demand = LogitDemand(LogitDemandInputs(2, 2, 1, 1))


    pb = demand.bertrand_prices(1, 1)

    pm = demand.monopoly_prices(1, 1)

    pb_result = demand.solve_logit_bertrand(1, 1)
    print('results', pb_result)
    print('bertrand', pb)
    print('monopoly', pm)
