import time

class Stopwatch:
    def __init__(self, start_time: float = time.time()):
            self.start_time = start_time
            self.split_time = start_time
            self.time_convert(start_time, "Timer started:")

    def time_convert(self, sec: float, print_text = "Time Lapsed ="):
        mins = sec // 60
        sec = sec % 60
        hours = mins // 60
        mins = mins % 60
        if print:
            self.print_time(hours, mins, sec, print_text)

    def print_time(self, hours, mins, sec, text = "Time Lapsed ="):
        hoursStr = str(int(hours)) if int(hours) >= 10 else '0'+str(int(hours))
        minStr = str(int(mins)) if int(mins) >= 10 else '0'+str(int(mins))
        secRound = round(sec, 2)
        secStr = str(secRound) if int(secRound) >= 10 else '0'+str(secRound)
        print(text, "{0}:{1}:{2}".format(hoursStr, minStr, secStr))

    def split(self, text: str = "Split time ="):
        current_time: float = time.time()
        split_interval = float(current_time) - float(self.split_time)
        self.split_time = current_time
        self.time_convert(split_interval, text)

    def total(self):
        current_time = time.time()
        total_time = current_time - self.start_time
        self.time_convert(total_time, "Total time =")