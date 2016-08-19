#!/bin/sh

/usr/bin/mjpg_streamer -i "./input_uvc.so -n -q 50 -r QVGA -f 15 -d /dev/video0" -o "./output_http.so -p 8080"
