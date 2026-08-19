import pytest
import math
from backend.core.math_engine import QueueEngine, erlang_c

def test_erlang_c_boundary():
    # If rho >= 1, pw should be 1.0 (overloaded)
    assert erlang_c(c=2, rho=1.0) == 1.0
    assert erlang_c(c=5, rho=1.5) == 1.0

def test_erlang_c_calculation():
    # Known M/M/c case: lambda=10, mu=6, c=2 => rho = 10/12 = 0.8333
    # Erlang C should be approx 0.769
    pw = erlang_c(c=2, rho=10/12)
    assert math.isclose(pw, 0.7575, abs_tol=0.001)

def test_queue_engine_littles_law_mmc():
    """
    Every queueing calculation that claims a wait-time estimate 
    must have a test asserting Little's Law holds (L = \\lambda W).
    """
    engine = QueueEngine(service_distribution="exponential")
    
    # lam = 15 patients/hr, mu = 6 patients/hr/counter, c = 3 counters
    lam = 15.0
    metrics = engine.calculate_metrics(arrival_rate=lam, service_rate=6.0, counters=3)
    
    # Assert Little's Law for queue: Lq = lambda * Wq
    assert math.isclose(metrics["Lq"], lam * metrics["Wq"], rel_tol=1e-9)
    
    # Assert Little's Law for system: L = lambda * W
    assert math.isclose(metrics["L"], lam * metrics["W"], rel_tol=1e-9)

def test_queue_engine_littles_law_mgc():
    """
    Assert Little's Law holds even for the M/G/c approximation (Sakasegawa).
    """
    engine = QueueEngine(service_distribution="general")
    
    lam = 15.0
    # CV of service time = 0.5 (less variance than exponential)
    metrics = engine.calculate_metrics(arrival_rate=lam, service_rate=6.0, counters=3, cv_service=0.5)
    
    # Assert Little's Law for queue: Lq = lambda * Wq
    assert math.isclose(metrics["Lq"], lam * metrics["Wq"], rel_tol=1e-9)
    
    # Assert Little's Law for system: L = lambda * W
    assert math.isclose(metrics["L"], lam * metrics["W"], rel_tol=1e-9)

def test_overloaded_system():
    engine = QueueEngine()
    # lam = 20, mu = 6, c = 3 => rho = 20/18 > 1
    metrics = engine.calculate_metrics(arrival_rate=20.0, service_rate=6.0, counters=3)
    
    assert metrics["rho"] > 1.0
    assert metrics["W"] == float('inf')
    assert metrics["L"] == float('inf')
