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
    $('.featuredURL').prop('href', "hike.html?track=" + hikeTrack +
        "&ttype='" + ttype +"'");

    var pagerOptions = {
      container: $(".pager"),
      // default output: {page}/{totalPages}
      output: '{startRow} to {endRow} ({totalRows})',
      updateArrows: true,
      page: 0,
      size: 10,
      fixedHeight: false,
      removeRows: false,
      cssNext: '.next',
      cssPrev: '.prev',
      cssFirst: '.first',
      cssLast: '.last',
      cssPageDisplay: '.pagedisplay',
      cssPageSize: '.pagesize',
      cssDisabled: 'disabled'
    };
        
    $(function() {
        $("#listOfHikes").tablesorter({
            widthFixed: true,
            widgets: ["zebra", "resizable", "saveSort"],
            sortList: [[2,1]],  // sort by hike date
            headers: {
            0: { sorter: 'float' },
            1: { sorter: 'text' },
            3: { sorter: 'digit' },
            }
        });
        $("#listOfHikes").tablesorterPager(pagerOptions)
    });

    $.get("data/rowList.html", function(html) { 
        // append the "ajax'd" data to the table body 
        $("#listOfHikes tbody").append(html); 
        // let the plugin know that we made a update 
        $("#listOfHikes").trigger("update"); 
    }); 

}); // End of ready()
