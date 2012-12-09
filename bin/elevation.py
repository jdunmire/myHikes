#
# elevation.py - get elevation from a web service
#
# Presently searches USGS, Mapquest and earthtools.org
#
import sys
import urllib, urllib2

from xml.dom import minidom

import progress

# get elevation, starting with the specified service.
elevSource = 'usgs'
#elevSource = 'mapquest'
#elevSource = 'earthtools'
def get(lon, lat, pbar=progress.wheel()):
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
        
        # This is a crude way to implement re-try,
        # it should be re-written as a loop.
        try:
            response = urllib2.urlopen(req)
        except:
            try:
                response = urllib2.urlopen(req)
            except:
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

    #sys.stdout.write('\b%s' % pbar()),
    #sys.stdout.flush()
    #print elev
    return elev
