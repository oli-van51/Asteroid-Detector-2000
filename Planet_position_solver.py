import math

def PositionSolver(m, e, a, b, tolerance=1e-6):
    ec = m
    delta = ec - e*math.sin(ec) - m
    while abs(delta) >= tolerance:
        ec -= delta/(1-e*math.cos(ec))
        delta = ec - e*math.sin(ec) - m
    x_coord = -a*math.cos(ec)
    y_coord = b*math.sin(ec)
    return x_coord, y_coord
    
