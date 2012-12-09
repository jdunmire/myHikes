#!/bin/bash
#
# mkFeatured.sh - create symlinks to make a map a 'featured map'
#
#
set -e

if [ $# -ne 1 ]
then
  echo "ERROR: Specifiy a map to be featured." 1>&2
  exit 1
fi

map=$1

if [[ "$map" == *".kml" ]]
then
  map=${map%.kml}
fi

if [ ! -e ${map}.kml ]
then
  echo "ERROR: Can not find map file: ${map}.kml" 1>&2
  exit 1
fi

extensions=".kml .json .txt .png"

for ext in $extensions
do
  rm -f "Featured${ext}"
done

for ext in $extensions
do
  ln -s "${map}${ext}" "Featured${ext}"
done

echo "${map} is now the Featured map."
