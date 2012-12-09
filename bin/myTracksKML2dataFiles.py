#!/usr/bin/env python
#
# myTracksKML2dataFiles.py - create datafiles for myHikes website
#
# This version handles the new MyTracks KML format that uses <gx:coord>
# Creates three files:
#   <fname>.json - distance(miles), elev(ft), lon, lat, gpsElev(m)
#   <fname>.txt  - description from KML file as an html snippet
#   <fname>.png  - a 40x40 pixel plot of the track, transparent #   background
#
# Adds a row for this track to the end of the rowList.html file.
#
import sys
import math
import urllib, urllib2

from xml.dom import minidom
import argparse

from geopy import distance
from geopy import Point

import matplotlib.pyplot as plt
import matplotlib.lines as lines

from datetime import datetime

import re

import progress
import elevation

#process command line
parser = argparse.ArgumentParser(description='Derive myHikes data files from a KML file')
parser.add_argument('kmlFile', 
                  help="input kml file.",
                  metavar="FILE")
parser.add_argument('--textOnly', action='store_true',
        default=False,
        help="Create only the text file.")

parser.add_argument('--skipElevation', action='store_true',
        default=False,
        help="Do not get elevations from the web and skip any elevation processing.")

parser.add_argument('--skipThumbnail', action='store_true',
        default=False,
        help="Do not generate thumbnail image")

args = parser.parse_args()

(fname, dot, suffix) = args.kmlFile.rpartition(".")
if not fname:
    fname = suffix

fname_json = fname + ".json"
fname_desc = fname + ".txt"

print "processing %s" % (fname + ".kml")

f = open(args.kmlFile)
kml = f.read()
f.close()
xmldoc = minidom.parseString(kml)

# Look for a summary description with a total distance.
# If found, the summary total distance will be used to scale the
# calculated distances.
descs = xmldoc.getElementsByTagName('description')

for desc in descs:
    try:

        if (desc.firstChild.data.find("Total distance:") >= 0):
            summary = desc.firstChild.data.strip()
            
            # Detect html vs plain text format and add html directives
            # if needed.
            if (summary.find('<p>') < 0 ):
                # the description does not have html directives, add them
                lines = summary.split('\n')
                firstLine = True
                for line in lines:
                    if (line.find('Created by') >= 0) or (len(line) == 0):
                        continue
                    if (firstLine == True):
                        summary = '<p id="fromKMLFile">' + line + '\n'
                        firstLine = False
                    else:
                        summary += '<br>' + line + '\n'
            
            # Eliminate the 'Created by...' string because it
            # doesn't seem to add anything useful to the description.
            summary = re.sub('^Crea.*<p>','<p>', summary)

            # put description in a separate file 
            descFile = open(fname_desc, "w+b")
            descFile.write(summary)
            descFile.close()

            #
            # Extract the distance from the summary.
            # Expected form:
            #    <p>Total distance: 9.75 km (6.1 mi)<br>
            #
            for s in summary.split('<'):
                if (s.find('Total distance:') >= 0):
                    (discard, values) = s.split(':')
                    (km, unit1, miles, unit2) = values.strip().split(' ')
                    reportedMiles = float(miles.lstrip('('))
    except: 
        continue

if args.textOnly == True:
    #print "text only exit"
    sys.exit(0)


m2ft = 1.0/(0.0254*12.0)
firstRecord = True
distFromStart = 0

# Look for a track
# There are two different formats for tracks in a KML file
# The new one uses the Google extension gx:Track, the old one uses a
# coordinates list.
tracks = xmldoc.getElementsByTagName('gx:Track')
if len(tracks) > 0:
    arr = []
    for track in tracks:
        coords = track.getElementsByTagName('gx:coord')
        for coord in coords:
            if coord:
                arr.append(coord.firstChild.data.strip())
    coordSep = ' '

else:
    tracks = xmldoc.getElementsByTagName('LineString')

    # Combine all coordinates into one array.
    arr = []
    for track in tracks:
        coords = track.getElementsByTagName('coordinates')
        if coords:
            coords = coords[0].firstChild.data.strip()
            if ' ' in coords:
                arr += coords.split(' ')
            else:
                arr += coords.split('\n')

    coordSep = ','

# divide the coordinates into points and distance and elevation in
# feet
points = []
x = []
y = []
if len(arr) > 1:
    for s in arr:
        if coordSep in s:
            (lon, lat, gpsElevInM) = s.strip().split(coordSep)
            lon = float(lon)
            lat = float(lat)
            x.append(lon)
            y.append(lat)
            gpsElevInM = float(gpsElevInM)
            thisPoint = Point(lat, lon, gpsElevInM)
            if not args.skipElevation:
                elev = elevation.get(lon, lat)
            else:
                elev = 0

            if firstRecord == True:
                distFromStart = 0
                firstRecord = False
            else:
                deltaDist = distance.distance(lastPoint, thisPoint).miles
                distFromStart += deltaDist

            elevInFt = elev * m2ft
            points.append((distFromStart, elevInFt, lon, lat, gpsElevInM))
            lastPoint = thisPoint

else:
    print "WARNING: No coordinates found."



if len(points) > 1:
    # Write the JSON file with with distances scaled to match the total
    # recorded in the KML file.
    calcDistTotal = max(points)[0]
    try:
        distScale = reportedMiles / float(calcDistTotal)
    except:
        distScale = 1.0

    if not args.skipElevation:
        jsonDistElev = open(fname_json, "w+b")
        jsonDistElev.write('{ "label": "Distance and USGS Elev (ft)", "data": [\n')
        for point in points:
            (distFromStart, elevInFt, lon, lat, gpsElevInM) = point
            jsonDistElev.write('[%.4f,%.1f,%.6f,%.6f,%.2f],\n' %
            (distFromStart * distScale, elevInFt, lon, lat, gpsElevInM))

        jsonDistElev.write('[]]}\n')
        jsonDistElev.close()

    if not args.skipThumbnail:
        # Now create a thumbnail of the track.
        # This is crude right now in that it treats the lat/lon as X/Y
        # without any projection. That is probably ok for any hiking track,
        # particularly given the small size of the thumbnail.
        # For now the track background is transparent. In the future I would
        # like to use the matplotlib basemap tool kit to put a real map
        # under the track, but basemap requires supporting libraries that
        # are not available on Ubuntu 10.10, and I don't want to go through
        # the effort to port the libraries. So the map underlay will have to
        # wait until I upgrade to Ubuntu 12.04 (or equivalent).
        # the plot size will 1"x1" so that it is easy to set the size in
        # pixels by setting DPI when the plot is written.
        fig = plt.figure(figsize=(1,1))
        ax = fig.add_subplot(111)
        ax.set_axis_off()
        ax.plot(x,y,linewidth=2,color='r')
        fig.savefig(fname + '.png',dpi=40,transparent=True)


    #
    # Generate a record describing the hike
    #
    startPlacemark = False
    lat = 0
    lon = 0
    placeNodes = xmldoc.getElementsByTagName('Placemark')
    if len(placeNodes) > 0:
        for placeNode in placeNodes:
            startPlacemark = False
            for child in placeNode.childNodes:
                if child.localName == 'name':
                    if child.firstChild.data.find('Start') >= 0:
                        # found the place node
                        startPlacemark = True
                        (title, sep, end) = child.firstChild.data.partition('(')
                elif child.localName == 'Point':
                    for pointChild in child.childNodes:
                        if pointChild.localName == 'coordinates':
                            coords = pointChild.firstChild.data.strip()
                            try:
                                (lat, lon, elev) = coords.split(',')
                            except:
                                (lat, lon) = coords.split(',')
                            lat = float(lat)
                            lon = float(lon)
                            # TODO: find and use the center of the track, not the
                            # start.
                
               # elif child.localName == 'description':
               #     try:
               #         dt = datetime.strptime(child.firstChild.data.strip(),
               #             "%m/%d/%Y %I:%M %p")
               #     except:
               #         dt = ""
                
            if startPlacemark == True:
                #print dt
                #print lat
                #print lon
                #print title.strip()
                break;

    else:
        print "ERROR: can not handle KML files that do not use gx:track!"
        #tracks = xmldoc.getElementsByTagName('LineString')

        # Combine all coordinates into one array.
        #for track in tracks:
        #    coords = track.getElementsByTagName('coordinates')
        #    if coords:
        #        coords = coords[0].firstChild.data.strip()
        #        print "coords = %s" % coords


    dist = ""
    descNodes = xmldoc.getElementsByTagName('description')
    if len(descNodes) > 0:
        for descNode in descNodes:
            try:
                desc = descNode.firstChild.data.strip()
            except:
                desc = ""

            if desc.find("Total distance") >= 0:
               distRE = re.compile(r"Total distance: .*?\((\d+\.\d+) mi")
               match = distRE.search(desc)
               if match is not None:
                   dist = "%s mi" % match.group(1)

               # search for date in old style description.
               dateRE = re.compile(r"Recorded: (.*?)<br>")
               match = dateRE.search(desc)
               if match is not None:
                   #print "DATE STRING %s " % match.group(1)
                   try:
                       dt = datetime.strptime(match.group(1),
                            "%m/%d/%Y %I:%M %p")
                   except:
                       dt = datetime.strptime(match.group(1),
                            "%m/%d/%y %I:%M %p")
               else:
                   # new style description has one key:value pair per line
                   # and there is no space between the time and the AM/PM
                   dateRE = re.compile(r"Recorded: (.*?)$")
                   match = dateRE.search(desc)
                   if match is not None:
                       #print "DATE STRING2 %s " % match.group(1)
                       try:
                           dt = datetime.strptime(match.group(1),
                                "%m/%d/%Y %I:%M%p")
                       except:
                           dt = datetime.strptime(match.group(1),
                                "%m/%d/%y %I:%M%p")
                
               regExp = re.compile(r"Activity type: (.*?)<br>")
               match = regExp.search(desc)
               if match is not None:
                   activity = "%s" % match.group(1)
               else:
                   regExp = re.compile(r"Activity type: (.*?)\n")
                   match = regExp.search(desc)
                   if match is not None:
                       activity = "%s" % match.group(1)


    latMid = ((max(y) + min(y))/2.0)
    lonMid = ((max(x) + min(x))/2.0)

    latLonHash = int(abs(latMid) * 1000000000) + abs(lonMid)

    # Thunbnail+coords,Name,Time/Date,Distance,lat,lon
    rowFormat ='<tr><td>' + \
    '<a href="hike.html?track=%s&ttype=\'gx:track\'">' + \
    '<img src="data/%s"/></a>' + \
    '<div style="display: none">%.5f</div>' + \
    '</td>' + \
    '<td>' + \
    '<a href="hike.html?track=%s&ttype=\'gx:track\'">' + \
    '%s</a>' + \
    '</td>' + \
    '<td>%s</td>' + \
    '<td>' + \
    '%s' + \
    '</td>' + \
    '<td>' + \
    '%s' + \
    '</td>' + \
    '<td class="lat" >%.6f</td>' + \
    '<td class="lon" >%.6f</td>' + \
    '</tr>\n'

    # Add the descriptiive record to the list of hikes
    rowList = open("rowList.html", 'a+')
    rowList.write( rowFormat % ( fname, fname + ".png", latLonHash, fname,
            title.strip(), activity, dt, dist, latMid, lonMid))
    rowList.close()


print "finished %s" % (fname + ".kml")
