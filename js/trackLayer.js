/*
 * trackLayer.js - Add a track from a KML file as a map overlay layer
 *
 * There are two types of KML supported:
 *    linestring - the track is in a <LineString> stanza
 *    gx:track   - track is in a Google extention stanza
 * This code defaults to linestring format files and any other explicit
 * setting of ttype is assumed to be a gx:track.
 *
 * A link is added in the locationMarks div.
 */

function addTrackLayer(map, kmlsource, ttype) {

    if (typeof(ttype)==='undefined') ttype = "linestring";

    parentMap = map;
    if (ttype == "linestring") {
      track = new OpenLayers.Layer.Vector(kmlsource, {
          projection: map.displayProjection,
          strategies: [ new OpenLayers.Strategy.Fixed()],
          protocol: new OpenLayers.Protocol.HTTP({
              url: kmlsource,
              format: new OpenLayers.Format.KML({
                  extractStyles: true,
                  extractAtributes: true,
                  //extractTracks: true,  // for gx:track, but ugly
                  maxDepth: 2
              })
          }),
                eventListeners: {
                    "beforefeatureadded": function(e) {
                        // group the tracks by fid and create one track for
                        // every fid
                        var feature = e.feature;
                        var desc;
                            desc = feature.attributes.description;
                        return true;
                    }
                }
      });
    } else {
      track = new OpenLayers.Layer.PointTrack(kmlsource, {
                //projection: geographic,
                projection: map.displayProjection,
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: kmlsource,
                    format: new OpenLayers.Format.KML({
                        extractTracks: true,
                        extractStyles: true,
                        extractAttributes: true
                    })
                }),
                //dataFrom: OpenLayers.Layer.PointTrack.TARGET_NODE,
                dataFrom: OpenLayers.Layer.PointTrack.SOURCE_NODE,
                styleFrom: OpenLayers.Layer.PointTrack.TARGET_NODE,
                eventListeners: {
                    "beforefeaturesadded": function(e) {
                        // group the tracks by fid and create one track for
                        // every fid
                        var fid, points = [], feature, desc;
                        var desc2;
                        for (var i=0, len=e.features.length; i<len; i++) {
                            feature = e.features[i];
                            desc = feature.attributes.description;
                            if (desc.search("Android") != -1) {
                              desc2 = desc;
                            }
                            if (feature.fid !== fid || i === len-1) {
                                fid = feature.fid;
                                this.addNodes(points, {silent: true});
                                points = [];
                            }
                            points.push(feature);
                        }
                        return false;
                    }
                }
            });
    }

    map.addLayer(track);

    label = kmlsource.substr(0,(kmlsource + '.').indexOf('.'));
    new setMark(map, {
      iconMapURL: "",
            desc: label + "<br/>",
        descIcon: "<i class='icon-picture'></i>",
              id: "id='" + label + "'"});
    /*
     * Hide the location link until the track is loaded.
     */
    $("#" + label).hide()

    function zoomTrackExtent(){
        var extent = track.getDataExtent();
        $("#" + label).click(function() {map.zoomToExtent(extent);});
        if (urlPosition == false) {
          map.zoomToExtent(extent);
        } else {
          urlPosition = false;
        }
        $("#" + label).show()
        return;
    }

    track.events.register("loadend", track, zoomTrackExtent);
    return track;

}

