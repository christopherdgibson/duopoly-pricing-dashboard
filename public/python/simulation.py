class MarketSimulation:
    def __init__(self, env, agent1, agent2, benchmarks, state=(0,0), all_p1=[], all_p2=[], all_r1=[], all_r2=[], trajectory=[]):
        self.env = env
        self.agent1 = agent1
        self.agent2 = agent2
        self.benchmarks = benchmarks
        self.state = state
        self.all_p1 = all_p1
        self.all_p2 = all_p2
        self.all_r1 = all_r1
        self.all_r2 = all_r2
        self.trajectory = trajectory