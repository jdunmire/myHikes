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
from optparse import OptionParser

from geopy import distance
from geopy import Point

import matplotlib.pyplot as plt
import matplotlib.lines as lines

from datetime import datetime

import re

#process command line
parser = OptionParser()
parser.add_option("-f", "--file", dest="infile",
                  help="input kml file.",
                  metavar="FILE")

(options, args) = parser.parse_args()

#require an input file
if not options.infile:
    print "ERROR: an input file is required."
    sys.exit(1)

# Progress wheel
class Progress():
    def __init__(self):
        self.count = 0
        self.spokes = '-\\|/'
        self.spokesLen = len(self.spokes)

    def __call__(self):
        self.count = (self.count + 1) % self.spokesLen
        return self.spokes[self.count]

    
# get elevation, starting with the specified service.
elevSource = 'usgs'
#elevSource = 'mapquest'
#elevSource = 'earthtools'
def get_elevation(lon, lat, pbar=Progress()):
    """Gets Elevation from the Net, in meters

       Starts search using requested service (usgs, mapquest, or earthtools).
       If elevation is not found in the requested service then it changes
       to the next service (which is then used for subsequent requests).
       Elevation is returned in meters. If not found in any service,
       the elevation will be returned as -9999.0 (from earthtools).
    """
    global elevSource

    elev = 0

    # USGS, precise, but slow (~2/sec) and only for USA
    #
    # ref: http://gisdata.usgs.gov/xmlwebservices2/Elevation_Service.php
    # example: http://gisdata.usgs.gov/xmlwebservices2/elevation_service.asmx/getElevation?X_Value=-121.825264&Y_Value=37.174081&Elevation_Units=meters&Source_Layer=-1&Elevation_Only=0
    if elevSource == 'usgs':
        #print "Using USGS"
        url='http://gisdata.usgs.gov/XMLWebServices/TNM_Elevation_Service.asmx/getElevation'

        # http GET args
        values = {
                'X_Value' : lon,
                'Y_Value' : lat,
                'Elevation_Units' : 'meters',
                'Source_Layer' : '-1',
                'Elevation_Only': '0',
                }

        # encode the GET arguments
        data = urllib.urlencode(values)
       
        # make the URL into a qualified GET statement:
        get_url = url + '?' + data

        # make the request: note that by ommitting the url arguments
        # we force a GET request, instead of a POST
        req = urllib2.Request(url=get_url)
        response = urllib2.urlopen(req)
        the_page = response.read()

        dom = minidom.parseString(the_page)
        result = dom.getElementsByTagName('double')
        elev = float(result[0].firstChild.data.strip())


    # MapQuest Open Elevation Service
    # If the USGS database did not return a value then make this the default source
    # for further requests.
    #
    # ref: http://open.mapquestapi.com/elevation/
    # example: http://open.mapquestapi.com/elevation/v1/profile?callback=handleHelloWorldResponse&shapeFormat=raw&latLngCollection=39.740112,-104.984856,39.799438,-105.72361,39.6403,-106.373596
    if elevSource == 'mapquest' or elev < 1e-5:
        url='http://open.mapquestapi.com/elevation/v1/profile'
        #print "Using MapQuest"

        # http GET args
        values = {
                'shapeFormat' : 'raw',
                'outFormat' : 'xml',
                'useFilter' : 'true',
                'unit' : 'm',  # f=feet, m=meters
                'latLngCollection' : '%f,%f' % (lat, lon) 
                }

        # encode the GET arguments
        data = urllib.urlencode(values)
       
        # make the URL into a qualified GET statement:
        get_url = url + '?' + data
        #print data

        # make the request: note that by ommitting the url arguments
        # we force a GET request, instead of a POST
        req = urllib2.Request(url=get_url)
        response = urllib2.urlopen(req)
        the_page = response.read()
        #print the_page

        dom = minidom.parseString(the_page)
        result = dom.getElementsByTagName('height')
        elev = float(result[0].firstChild.data.strip())

    # earthtools.org
    # If the elevation was not found in USGS or MapQuest, then switch to Earth Tools.
    # This occurs when the coordinates are outside the US.
    #
    # ref: http://www.earthtools.org/webservices.htm#height
    # template: http://www.earthtools.org/height/<lat>/<lon>
    if elevSource == 'earthtools' or elev < -1e-5:
        #print "Using earthtools.org"
        elevSource = 'earthtools'
        url="http://www.earthtools.org/height/%s/%s" % (lat, lon)
        elevXML = urllib2.urlopen(urllib2.Request(url)).read()
        dom = minidom.parseString(elevXML)
        elevStanza = dom.getElementsByTagName('meters')
        elev = float(elevStanza[0].firstChild.data.strip())

    sys.stdout.write('\b%s' % pbar()),
    sys.stdout.flush()
    #print elev
    return elev


(fname, dot, suffix) = options.infile.rpartition(".")
if not fname:
    fname = suffix

fname_json = fname + ".json"
fname_desc = fname + ".txt"

print "processing %s" % (fname + ".kml")

f = open(options.infile)
kml = f.read()
f.close()
xmldoc = minidom.parseString(kml)

# Look for a summary description with a total distance.
# If found, the summary total distance will be used to scale the
# calculated distances.
descs = xmldoc.getElementsByTagName('description')

for desc in descs:
    try:

        if (desc.firstChild.data.find("Total distance:") > 0):
            summary = desc.firstChild.data.strip()
            # delete the 'Created by' string.
            
            # put description in a separate file 
            descFile = open(fname_desc, "w+b")
            
            # Eliminate the 'Created by...' string because it
            # doesn't seem to add anything useful to the description.
            summary = re.sub('^Crea.*<p>','<p>', summary)

            descFile.write(summary)
            descFile.close()

            #
            # Extract the distance from the summary.
            # Expected form:
            #    <p>Total distance: 9.75 km (6.1 mi)<br>
            #
            for s in summary.split('<'):
                if (s.find('Total distance:') > 0):
                    (discard, values) = s.split(':')
                    (km, unit1, miles, unit2) = values.strip().split(' ')
                    reportedMiles = float(miles.lstrip('('))
    except: 
        continue

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
            elev = get_elevation(lon, lat)

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

    jsonDistElev = open(fname_json, "w+b")
    jsonDistElev.write('{ "label": "Distance and USGS Elev (ft)", "data": [\n')
    for point in points:
        (distFromStart, elevInFt, lon, lat, gpsElevInM) = point
        jsonDistElev.write('[%.4f,%.1f,%.6f,%.6f,%.2f],\n' %
        (distFromStart * distScale, elevInFt, lon, lat, gpsElevInM))

    jsonDistElev.write('[]]}\n')
    jsonDistElev.close()

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


    startPlacemark = False
    lat = 0
    lon = 0
    dt = 0
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
                elif child.localName == 'description':
                    try:
                        dt = datetime.strptime(child.firstChild.data.strip(),
                            "%m/%d/%Y %I:%M %p")
                    except:
                        dt = ""
                
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
    '<td>' + \
    '%s' + \
    '</td>' + \
    '<td>' + \
    '%s' + \
    '</td>' + \
    '<td class="lat" >%.6f</td>' + \
    '<td class="lon" >%.6f</td>' + \
    '</tr>\n'

    rowList = open("rowList.html", 'a+')
    rowList.write( rowFormat % ( fname, fname + ".png", latLonHash, fname,
            title.strip(), dt, dist, latMid, lonMid))
    rowList.close()

