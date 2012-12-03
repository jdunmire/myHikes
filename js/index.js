/* Author: J.Dunmire
 * 
 * index.js - code specific to index.html
 */

var  urlPosition = false;   // used in tfmap.js

function disablePager() {
  $('#listOfHikes').trigger('destroy.pager');
  $('tr.tablesorter-filter').css('display', '');
  $('input[placeholder="lat"]').parent().hide();
  $('input[placeholder="lon"]').parent().hide();
  $('input[placeholder="thumbnail"]').hide();
}

function enablePager() {
  $('tr.tablesorter-filter').css('display', 'none');
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
  $("#listOfHikes").tablesorterPager(pagerOptions);
  $('input[placeholder="lat"]').parent().hide();
  $('input[placeholder="lon"]').parent().hide();

}

jQuery(document).ready(function() {
    addLastModified();
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

    $(function() {
        $("#listOfHikes").tablesorter({
            widthFixed: true,
            widgets: ["zebra", "resizable", "saveSort", "filter"],
            sortList: [[2,1]],  // sort by hike date
            headers: {
              0: { sorter: 'float', filter: false},
              1: { sorter: 'text' },
              3: { sorter: 'digit' },
              4: { filter: false },
              5: { filter: false },
            },
            widgetOptions : {
              filter_cssFilter : 'tablesorter-filter',
              filter_childRows : false,
              filter_startsWith: false,
              filter_ignoreCase : true,
              filter_searchDelay : 300,
              filter_functions: {},
            },
        });
        //$("#listOfHikes").tablesorterPager(pagerOptions)
    });

    $.get("data/rowList.html", function(html) { 
        // append the "ajax'd" data to the table body 
        $("#listOfHikes tbody").append(html); 
        // let the plugin know that we made a update 
        $("#listOfHikes").trigger("update"); 
        enablePager();
        $('input[placeholder="thumbnail"]').parent().append(
          '<button class="btn searchBtn" onClick="enablePager();"> <i class="icon-remove"></i></button>'
          );
    }); 

}); // End of ready()
