#!/usr/bin/env python
#
# progress.py - ASCII progress wheel
#
#

# Progress wheel
class wheel():
    def __init__(self):
        self.count = 0
        self.spokes = '-\\|/'
        self.spokesLen = len(self.spokes)

    def __call__(self):
        self.count = (self.count + 1) % self.spokesLen
        return self.spokes[self.count]

