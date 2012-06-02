/*
 * setMark.js - Put a marker on the map and a link in the document
 */
function setMark(map, options) {
    var settings = $.extend(
        {
            iconMapURL: "img/house_16x16.png",
             icon_x: 16,
             icon_y: 16,
                lon: -121.99898,
                lat: 37.34424,
               zoom: 15,
            linkDiv: "#locationLinks",
               desc: "Text Here<br>",
           descIcon: "<i class='icon-map-marker'></i>",
         }, options);

    iconSize = new OpenLayers.Size(settings.icon_x,settings.icon_y);
    calculateOffset = function(size) {
        return new OpenLayers.Pixel(-(size.w/2), -size.h); };

    icon = new OpenLayers.Icon(settings.iconMapURL,
        iconSize, null, calculateOffset);

    lonLat = new OpenLayers.LonLat(settings.lon, settings.lat).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
        );

    markers = map.getLayer("Markers");
    if (markers == null) {
      markers = new OpenLayers.Layer.Markers("Markers");
      markers.id = "Markers";
      map.addLayer(markers);
    }

    markers.addMarker(new OpenLayers.Marker(
        lonLat, icon));

    /* set a link in a known div
     * icon description link to show position
     */
    $(settings.linkDiv).append("<a href='#'>"
        + settings.descIcon
        + " " 
        + settings.desc
        + "</a>");

    $(settings.linkDiv + " a:last").click(function() {map.setCenter(lonLat, settings.zoom);});
}
