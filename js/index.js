/* Author: J.Dunmire
 * 
 * index.js - code specific to index.html
 */

var  urlPosition = false;   // used in tfmap.js

jQuery(document).ready(function() {
    $("#statTable").hide();
    myMap = initMapLayers("map", "none");
    hikeTrack = "PaloAltoBaylands_20120520"
    ttype = 'gx:track';

    myTour = addTrackLayer(myMap, "data/" + hikeTrack + ".kml", ttype);
    $('#featuredDesc').load("data/" + hikeTrack + '.txt',
        function(response, loadStatus, xhr) { 
        if (loadStatus == "error") {
        $('#featuredDesc').append('Not available');
        }
        $('.desc_progress').hide();
        });
    $('#featuredURL').prop('href', "hike.html?track=" + hikeTrack +
        "&ttype='" + ttype +"'");

    //debug: true,
    $(function() {
        $("#listOfHikes").tablesorter({
            sortList: [[2,1]],  // sort by hike date
            headers: {
            0: { sorter: 'float' },
            1: { sorter: 'text' },
            3: { sorter: 'digit' },
            }
        });
    });

    $.get("data/rowList.html", function(html) { 
        // append the "ajax'd" data to the table body 
        $("#listOfHikes tbody").append(html); 
        // let the plugin know that we made a update 
        $("#listOfHikes").trigger("update"); 
    }); 

}); // End of ready()
