#! /bin/bash

CONVERT=`which convert`
ZEROXFB=`which 0xfb`

for i in `ls $1`; do
  $CONVERT $i -resize 1000x1000\> jpeg:- | $ZEROXFB uploadphoto
done