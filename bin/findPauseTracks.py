#!/usr/bin/env python
#
# Usage:
#    cd dataFiles
#    for f in *.kml
#    do
#      findPauseTracks.py $f
#    done
#
#   if the track has a 'pause' in it, then the track name will be printed.
#
# A 'pause' is indicated by:
#    </gx:Track>
#    <gx:Track>
# in the file.
#
import sys


if sys.argv[1:]:
    pass
else:
    print "ERROR: missing filename argument."
    sys.exit(1)

for fname in sys.argv[1:]:
    #print "Reading " + fname
    f = open(fname)
    kml = f.read()
    f.close()

    lines = kml.split('\n')
    trackFound = False
    for line in lines:
        #print line
        if line.find("gx:Track") >= 0 :
            if trackFound == True:
                print fname
                break;
            else:
                trackFound = True
        else:
            trackFound = False

