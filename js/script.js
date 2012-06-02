/* Author: J.Dunmire

*/

var urlPosition = false;

jQuery(document).ready(function() {
    $("#statTable").hide();
    myMap = initMapLayers();
    home = new setMark(myMap, {zoom: 11, desc: "Home<br/>",
        iconMapURL: "",
        icon_x: 0,
        icon_y: 0,
        descIcon: "<i class='icon-home'></i>"});

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

    myTour = addTrackLayer(myMap, track + ".kml", ttype);
    myChart = new addElevChart("#elevPlot",
      track + ".json", myMap); //"distElev.json");
    
});
