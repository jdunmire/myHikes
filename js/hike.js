/* Author: J.Dunmire

*/

var urlPosition = false;

// look for last character of window.location.pathname to be '/' or for
// the last last element of the path to be 'index.html' and use that to
// decide how the map will be initialized.
//
jQuery(document).ready(function() {
    $("#statTable").hide();
    myMap = initMapLayers("map");
    /*
    home = new setMark(myMap, {zoom: 11, desc: "Home<br/>",
        iconMapURL: "",
        icon_x: 0,
        icon_y: 0,
        descIcon: "<i class='icon-home'></i>"});
    */

    function gup( name )
    {
      name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
      var regexS = "[\\?&]"+name+"=([^&#]*)";
      var regex = new RegExp( regexS );
      var results = regex.exec( window.location.href );
      if( results == null )
        return "";
      else
        return results[1];
    }

    var zoom = gup('zoom');
    var lat = gup('lat');
    var lon = gup('lon');
    var track = gup('track');
    var ttype = gup('ttype');

    if (track == "") {
       track = "QuickSilver_20120304";
    }

    if (ttype == "") {
      ttype = 'linestring';
    }

    if ((zoom != "") & (lat != "") & (lon != "")) {
      myMap.setCenter(new OpenLayers.LonLat(lon,lat).transform(myMap.displayProjection, myMap.getProjectionObject()) ,zoom);
      urlPosition = true;
    }

    myTour = addTrackLayer(myMap, "data/" + track + ".kml", ttype);
    myChart = new addElevChart("#elevPlot",
      "data/" + track + ".json", myMap); //"distElev.json");
    /*
    $.get("data/" + track + '.txt',
          function(data) {
            $('#trailDesc').append(data);
            }
         );
         */
    $('#myTracksDesc').load("data/" + track + '.txt',
        function(response, loadStatus, xhr) { 
           if (loadStatus == "error") {
              $('#myTracksDesc').append('Not available');
              }
           $('.desc_progress').hide();
                });
});
