#!/bin/bash
#
# mkPkg.sh - make a package to upload to web site
#

pkgContents="\
js/about.js \
js/elevChart2.js \
js/flotResize.js \
js/hike.js \
js/index.js \
js/lastModified.js \
js/myHome.js \
js/planning.js \
js/setMark.js \
js/tfmaps.js \
js/trackLayer.js \
js/libs/bootstrap/bootstrap.js \
js/libs/bootstrap/bootstrap.min.js \
js/libs/flot/jquery.flot.crosshair.js \
js/libs/flot/jquery.flot.crosshair.min.js \
js/libs/flot/jquery.flot.js \
js/libs/flot/jquery.flot.min.js \
js/libs/jquery-1.7.2.min.js \
js/libs/jquery.metadata.js \
js/libs/jquery.tablesorter.js \
js/libs/jquery.tablesorter.min.js \
js/libs/jquery.tablesorter.pager.js \
js/libs/jquery.tablesorter.pager.min.js \
js/libs/jquery.tablesorter.widgets.js \
js/libs/jquery.tablesorter.widgets.min.js \
js/libs/modernizr-2.5.3-respond-1.1.0.min.js \
js/libs/OL/img/blank.gif \
js/libs/OL/img/cloud-popup-relative.png \
js/libs/OL/img/drag-rectangle-off.png \
js/libs/OL/img/drag-rectangle-on.png \
js/libs/OL/img/east-mini.png \
js/libs/OL/img/layer-switcher-maximize.png \
js/libs/OL/img/layer-switcher-minimize.png \
js/libs/OL/img/marker-blue.png \
js/libs/OL/img/marker-gold.png \
js/libs/OL/img/marker-green.png \
js/libs/OL/img/marker.png \
js/libs/OL/img/measuring-stick-off.png \
js/libs/OL/img/measuring-stick-on.png \
js/libs/OL/img/north-mini.png \
js/libs/OL/img/panning-hand-off.png \
js/libs/OL/img/panning-hand-on.png \
js/libs/OL/img/slider.png \
js/libs/OL/img/south-mini.png \
js/libs/OL/img/west-mini.png \
js/libs/OL/img/zoombar.png \
js/libs/OL/img/zoom-minus-mini.png \
js/libs/OL/img/zoom-plus-mini.png \
js/libs/OL/img/zoom-world-mini.png \
js/libs/OL/OpenLayers.js \
js/libs/OL/theme/default/style.css \
 \
css/bootstrap.min.css \
css/bootstrap-responsive.min.css \
css/bootstrap-responsive.css \
css/bootstrap.css \
css/jquery.tablesorter.pager.css \
css/style.css \
 \
img/next.png \
img/glyphicons-halflings-white.png \
img/house_24x24.png \
img/last.png \
img/desc.gif \
img/house_16x16.png \
img/glyphicons-halflings.png \
img/house.svg \
img/first.png \
img/prev.png \
img/loading.gif \
img/asc.gif \
img/bg.gif \
 \
hike.html \
planning.html \
index.html \
about.html \
favicon.ico \
"

tar -czf webPages.tgz $pkgContents data_all/ data/
