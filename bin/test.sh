#!/bin/sh

find test/ -name '*js' -execdir node '{}' \;
