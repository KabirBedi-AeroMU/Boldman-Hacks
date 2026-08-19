import math
from typing import Literal, Dict, Union

def erlang_c(c: int, rho: float) -> float:
    """Calculate Erlang-C formula for probability of waiting."""
    if rho >= 1.0:
        return 1.0 # System overloaded
    
    c_rho = c * rho
    
    # Sum terms
    sum_terms = 0.0
    for i in range(c):
        sum_terms += (c_rho ** i) / math.factorial(i)
        
    last_term = (c_rho ** c) / (math.factorial(c) * (1 - rho))
    
    pw = last_term / (sum_terms + last_term)
    return pw

class QueueEngine:
    def __init__(self, service_distribution: Literal["exponential", "general"] = "exponential"):
        """
        Initialize the queueing engine.
        service_distribution is a pluggable parameter.
        By default it uses M/M/c exact analytical solution.
        Setting it to "general" enables M/G/c approximation (Sakasegawa).
        """
        self.service_distribution = service_distribution

    def calculate_metrics(self, arrival_rate: float, service_rate: float, counters: int, cv_service: float = 1.0) -> Dict[str, Union[float, str]]:
        """
        Calculate expected wait times and queue lengths.
        
        Args:
            arrival_rate (lambda): patients arriving per hour
            service_rate (mu): patients served per hour per active counter
            counters (c): active counters serving the queue
            cv_service: Coefficient of variation for service time (only used if general distribution)
            
        Returns:
            Dict containing L, Lq, W, Wq, rho, pw.
            W and Wq are in hours.
        """
        lam = arrival_rate
        mu = service_rate
        c = counters
        
        if lam == 0 or mu == 0 or c == 0:
            return {
                "L": 0.0, "Lq": 0.0, "W": 0.0, "Wq": 0.0, "rho": 0.0, "pw": 0.0
            }
            
        rho = lam / (c * mu)
        if rho >= 1.0:
             # System unstable, queue grows infinitely
             return {
                "L": float('inf'), "Lq": float('inf'), "W": float('inf'), "Wq": float('inf'), "rho": rho, "pw": 1.0
             }
             
        # Base probability of waiting is Erlang-C for M/M/c
        pw = erlang_c(c, rho)
        
        if self.service_distribution == "exponential":
            # M/M/c Exact analytical solution
            wq = pw / (c * mu - lam)
            w = wq + (1.0 / mu)
            lq = lam * wq
            l = lam * w
            
        elif self.service_distribution == "general":
            # M/G/c Approximation (Sakasegawa's formula)
            # Wait time is scaled by the variance of the service time distribution
            wq_mmc = pw / (c * mu - lam)
            wq = wq_mmc * ((1.0 + cv_service**2) / 2.0)
            w = wq + (1.0 / mu)
            lq = lam * wq
            l = lam * w
        else:
            raise ValueError(f"Unsupported distribution: {self.service_distribution}")
            
        return {
            "L": l,
            "Lq": lq,
            "W": w,
            "Wq": wq,
            "rho": rho,
            "pw": pw
        }
