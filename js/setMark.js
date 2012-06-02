/*
 * setMark.js - Put a marker on the map and a link in the document
 *
 * If just a link is needed, set iconMapURL to "" and a marker will not
 * be added.
 */
function setMark(map, options) {
    var settings = $.extend(
        {
            iconMapURL: "img/house_16x16.png",
             icon_x: 16,
             icon_y: 16,
                lon: -122,
                lat: 37.34,
               zoom: 15,
            linkDiv: "#locationLinks",
               desc: "Text Here<br>",
           descIcon: "<i class='icon-map-marker'></i>",
                 id: ""
         }, options);

    lonLat = new OpenLayers.LonLat(settings.lon, settings.lat).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
        );

    if (settings.iconMapURL != "") {
      iconSize = new OpenLayers.Size(settings.icon_x,settings.icon_y);
      calculateOffset = function(size) {
          return new OpenLayers.Pixel(-(size.w/2), -size.h); };

      icon = new OpenLayers.Icon(settings.iconMapURL,
          iconSize, null, calculateOffset);

      markers = map.getLayer("Markers");
      if (markers == null) {
        markers = new OpenLayers.Layer.Markers("Markers");
        markers.id = "Markers";
        map.addLayer(markers);
      }

      markers.addMarker(new OpenLayers.Marker(
          lonLat, icon));
    }

    /* set a link in a known div
     * icon description link to show position
     */
    $(settings.linkDiv).append("<a href='#' " + settings.id + ">"
        + settings.descIcon
        + " " 
        + settings.desc
        + "</a>");

    $(settings.linkDiv + " a:last").click(function() {map.setCenter(lonLat, settings.zoom);});
}
