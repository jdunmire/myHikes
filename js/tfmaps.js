/*
 * map.js - initialize map layers
 */

function initMapLayers() {
    // Overall map setup
    var map = new OpenLayers.Map({
        div: "map",
        controls:[
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.PanZoomBar(),
        new OpenLayers.Control.Permalink(),
        new OpenLayers.Control.ScaleLine(),
        new OpenLayers.Control.MousePosition()],
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m",
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34)
        }
        );

    // -------------- BASE MAP LAYERS ------------------------
    // Definition order controls the display order.
    //

    // OpenCycleMaps tile server
    var tr1 = "http://a.tile3.opencyclemap.org/"
    var tr2 = "http://b.tile3.opencyclemap.org/"
    var tr3 = "http://c.tile3.opencyclemap.org/"
    ocmPath = "landscape/${z}/${x}/${y}.png";
    landscape = new OpenLayers.Layer.OSM(
            "TF Landscape",
            [tr1 + ocmPath, tr2 + ocmPath, tr3 + ocmPath],
            {numZoomLevels: 18});
    map.addLayer(landscape);

    var tr1 = "http://a.tile.opencyclemap.org/"
    var tr2 = "http://b.tile.opencyclemap.org/"
    var tr3 = "http://c.tile.opencyclemap.org/"
    ocmPath = "cycle/${z}/${x}/${y}.png";
    cycle = new OpenLayers.Layer.OSM(
            "TF Cycle",
            [tr1 + ocmPath, tr2 + ocmPath, tr3 + ocmPath],
            {numZoomLevels: 18});
    map.addLayer(cycle);

    // Mapquest Developer Network
    var tr1 = "http://oatile1.mqcdn.com/tiles/1.0.0/"
    var tr2 = "http://oatile2.mqcdn.com/tiles/1.0.0/"
    var tr3 = "http://oatile3.mqcdn.com/tiles/1.0.0/"
    ocmPath = "sat/${z}/${x}/${y}.png";
    aerial = new OpenLayers.Layer.OSM(
            "MapQuest Open Aerial",
            [tr1 + ocmPath, tr2 + ocmPath, tr3 + ocmPath],
            {numZoomLevels: 19});
    map.addLayer(aerial);


    var mapBounds = new OpenLayers.Bounds( -122.02437, 37.35203, -121.98218, 37.33603);
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    if (urlPosition == false) {
      map.zoomToExtent(mapBounds.transform(
            map.displayProjection,
            map.getProjectionObject()));
    };
    return map;
}
