/*
 * elevChart.js - Add an elevation chart
 *
 * Requires: jquery.js, jquery.flot.min.js, jquery.flot.crosshair.js
 *
 * Reads a json source with these fields:
 *   distance(in miles), elevation(in feet), longitude, latitude,
 *   gpsElevation (in meters)
 *
 * Creates a chart showing elevation vs distance. When pointer hovers
 * over a data point on the chart, a position marker is updated on an
 * associated map.
 *
 * Writes a summary of the distance and elevation into the Trail Info
 * (statTable) table.
 */

// Use this function
function addElevChart(chartID, dataurl, map) {
    var myVectorLayer;
    var pointFeature;
    var style_trackMarker = {
             strokeColor: "#666666",
             strokeOpacity: 1,
             strokeWidth: 2,
             pointRadius: 5,
             pointerEvents: "visiblePainted"
    };

        var myDisplayProjection;
        var myProjection;

        // Format the chart
        elevChart = new chartSetup(chartID);

        // Load data into the chart
        plotData(elevChart, dataurl);

        // Vector layor to indicate position of cursor in the elevation plot
        myVectorLayer = new OpenLayers.Layer.Vector("Track Cursor");
        map.addLayer(myVectorLayer);
        myDisplayProjection = map.displayProjection;
        myProjection = map.getProjectionObject();


        function chartSetup(divID) {
            this.data = new Array();
            this.divId = divID;
            this.options = {
                series: { shadowSize: 0},
                crosshair: {mode: "x"},
                grid: {hoverable: true, autoHighlight: false},
                yaxis: {labelWidth: 30},
              };
            this.plot;
        }


        function plotData(chart, dataurl) {

            function onDataReceived(series) {
                chart.data.push(series);
                
                chart.plot = $.plot($(chart.divId), chart.data, chart.options);
                $(chart.divId).bind('plothover', updateTrackPos);
                $('#trackStats').html("<b>pos:<br>elev:<br>dist:</b>");
                var elevStats = elevMaxMin(series);
                $('#elevMax').html(elevStats.max.toFixed(0))
                $('#elevMin').html(elevStats.min.toFixed(0))
                $('#elevGain').html(elevStats.gain.toFixed(0))
                $('#distTotal').html(series.data[series.data.length - 2][0].toFixed(2))
                $('#elevMax_m').append("(" + (elevStats.max * 0.3048).toFixed(0) + " m)")
                $('#elevMin_m').append("(" + (elevStats.min * 0.3048).toFixed(0) + " m)")
                $('#elevGain_m').append("(" + (elevStats.gain * 0.3048).toFixed(0) + " m)")
                $('#distTotal_m').append("(" + ((series.data[series.data.length - 2][0]) * 1.609344).toFixed(1) + " km)")

                $('.elev_progress').hide();
                $('#statTable').show();
            }

            $.ajax({
                url: dataurl,
                method: 'GET',
                dataType: 'json',
                timeout: 1000,
                success: onDataReceived,
                error: function() { $('#statTable').text('Not available');
                $('#statTable').show();
                $('.elev_progress').hide()}
            });
        }

        function elevMaxMin(series) {
            var max = -10000;
            var min = 100000;
            var last = null;
            var gain = 0;
            for (i=0; i<series.data.length; i++) {
                if (series.data[i][1] > max) {
                    max = series.data[i][1];
                }
                if (series.data[i][1] < min) {
                    min = series.data[i][1];
                }
                if ((last != null) && (series.data[i][1] > last)) {
                    gain += series.data[i][1] - last;
                }
                last = series.data[i][1];
            }
            return {
                'max': max,
                'min': min,
                'gain': gain,
            };
        }

    // returns index nearest the value
    function binarySearchNearest(series, value) {
        var startIndex  = 0,
            stopIndex   = series.data.length - 2, // -2 because last element is empty
            middle      = Math.floor((stopIndex + startIndex)/2);

        var vt=series.data[middle][0];
        while(series.data[middle][0] != value && startIndex < stopIndex){

            //adjust search area
            if (value < series.data[middle][0]){
                stopIndex = middle - 1;
            } else if (value > series.data[middle][0]){
                startIndex = middle + 1;
            }

            //recalculate middle
            middle = Math.floor((stopIndex + startIndex)/2);
            vt=series.data[middle][0];
        }

        return(middle);
    }


    function updateTrackPos(event, pos, item) {
        // Extra credit: hover over max or min elevation and
        // point gets identified on map.
        elevChart.plot.setCrosshair(pos);
        if (item != null) {
            // when cursor is close to the plotted line an 'item' is
            // returned and we can use it directly.
            plotTrackPos(item.series.data, item.dataIndex);

        } else {
            // the cursor is not close to the plotted line, but we don't
            // care if the cursor is above or below the line. So use a
            // binary search to find the nearest index and use that to get a
            // lon/lat position to plot.
            var series = elevChart.plot.getData()[0];
            var index = binarySearchNearest(series, pos.x);
            plotTrackPos(series.data, index);
        };
    };


    function plotTrackPos(data, index) {
        var lon = data[index][2];
        var lat = data[index][3];
        if (pointFeature != null) {
            myVectorLayer.removeFeatures(pointFeature);
            pointFeature.destroy();
        }

        var point = new OpenLayers.Geometry.Point(lon, lat)
            .transform(myDisplayProjection, myProjection);

        pointFeature = new OpenLayers.Feature.Vector(point, null, style_trackMarker);
        myVectorLayer.addFeatures(pointFeature);
        $('#locStats').html("<b>pos: </b>" + lon.toFixed(6) + ','
                + lat.toFixed(6));
        $('#locStats').append("<b>elev: </b>" + data[index][1].toFixed(0) + ' ft');
        $('#locStats').append("<b>dist: </b>" + data[index][0].toFixed(2) + ' mi');
    };

}
