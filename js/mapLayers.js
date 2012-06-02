/*
 * map.js - initialize map layers for PRAtopo based maps
 */

function initMapLayers() {
    // Over-all map setup
    var map = new OpenLayers.Map({
        div: "map",
        controls:[
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.PanZoomBar(),
        new OpenLayers.Control.Permalink(),
        new OpenLayers.Control.ScaleLine(),
        new OpenLayers.Control.MousePosition()],
        //projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m",
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34)
        }
        );

    // -------------- BASE MAP LAYERS ------------------------
    // Definition order controls the display order.
    //

    /*
    // PRAtopo server provides these base maps
    //   - Pre-generated mapnik tiles
    //   - mod_tile generated mapnik tiles
    //   - pre-generated color-relief tiles (for topo maps)
    //   - blank tiles
    var praTopo1 = "http://pratopo.sj.pioneer-pra.com"

    // Color relief - defined first so that it is the default
    path = "/topo/color-relief/${z}/${x}/${y}.jpg";
    colorRelief = new OpenLayers.Layer.OSM(
            "Color relief (topo)",
            [praTopo1 + path],
            {numZoomLevels: mapMaxZoom});
    map.addLayer(colorRelief);


    // Mapnik
    path = "/mapnik/${z}/${x}/${y}.png";
    mapnik = new OpenLayers.Layer.OSM(
            "Local Mapnik, pregenerated",
            [praTopo1 + path],
            {numZoomLevels: 17});
    map.addLayer(mapnik);

    // Mapnik, mod_tile
    path = "/osmtiles2/${z}/${x}/${y}.png";
    mapnik2 = new OpenLayers.Layer.OSM(
            "Local Mapnik, on-demand",
            [praTopo1 + path],
            {numZoomLevels: 19});
    map.addLayer(mapnik2);

    */

    //var mapBounds = new OpenLayers.Bounds( -121.97056, 37.36753, -121.88859, 37.41288);
    var mapBounds = new OpenLayers.Bounds( -122.02437, 37.35203, -121.98218, 37.33603);
    // OpenCycleMaps tile server
    var tr1 = "http://a.tile.opencyclemap.org/cycle"
    var tr2 = "http://b.tile.opencyclemap.org/cycle"
    var tr3 = "http://c.tile.opencyclemap.org/cycle"
    ocmPath = "/${z}/${x}/${y}.png";
    openCycleMap = new OpenLayers.Layer.OSM(
            "Open Cycle Map" );//,
//            [tr1 + ocmPath, tr2 + ocmPath, tr3 + ocmPath],
//            {numZoomLevels: 18});
    map.addLayer(openCycleMap);

    // ----------------- OVERLAYS ------------------

    /*
    // topo overlays from PRAtopo
    path = "/topo/contours/${z}/${x}/${y}.png";
    contours = new OpenLayers.Layer.OSM(
            "Contour lines",
            [praTopo1 + path],
            {numZoomLevels: 21});
    contours.setIsBaseLayer(false);
    map.addLayer(contours);

    path = "/topo/features/${z}/${x}/${y}.png";
    features = new OpenLayers.Layer.OSM(
            "Map features",
            [praTopo1 + path],
            {numZoomLevels: 21});
    features.setIsBaseLayer(false);
    map.addLayer(features);

    // usgs Images overlays from PRAtopo
    function overlay_getTileURL(bounds) {
        var res = this.map.getResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
        var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
        var z = this.map.getZoom();
        return this.url + z + "/" + x + "/" + y + "." + this.type;
    }  

    usgs = new OpenLayers.Layer.TMS(
            "USGS SF 2009 Images", praTopo1 + "/usgsimg/SF_2009/",
            {
              type: 'png', getURL: overlay_getTileURL, alpha: true,
              isBaseLayer: false, visibility: false,
              numZoomLevels: 21
              });

    usgsNAIP = new OpenLayers.Layer.TMS(
            "USGS NAIP Images", praTopo1 + "/usgsimg/NAIP/",
            {
              type: 'png', getURL: overlay_getTileURL, alpha: true,
              isBaseLayer: false, visibility: false,
              numZoomLevels: 19
              });

    usgsSC06 = new OpenLayers.Layer.TMS(
            "USGS SC 2006 Images", praTopo1 + "/usgsimg/SC_2006/",
            {
              type: 'png', getURL: overlay_getTileURL, alpha: true,
              isBaseLayer: false, visibility: false,
              });
    if (OpenLayers.Util.alphaHack() == false) { usgs.setOpacity(0.6);}
    if (OpenLayers.Util.alphaHack() == false) { usgsNAIP.setOpacity(0.6);}
    if (OpenLayers.Util.alphaHack() == false) { usgsSC06.setOpacity(0.6);}
    map.addLayer(usgs);
    map.addLayer(usgsNAIP);
    map.addLayer(usgsSC06);

    // Overlay with OSM tile names and coordinates
    path = "/tilenames/${z}/${x}/${y}.png";
    tilenames = new OpenLayers.Layer.OSM(
            "Tile names / coords",
            [praTopo1 + path],
            {numZoomLevels: 21, visibility: false});
    tilenames.setIsBaseLayer(false);
    map.addLayer(tilenames);
    */

    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToExtent( mapBounds.transform(map.displayProjection, map.getProjectionObject() ) );
//    map.zoomToExtent( mapBounds.transform(map.displayProjection, map.projection ) );
    return map;
}
