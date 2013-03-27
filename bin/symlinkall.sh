#!/bin/sh
#
# Seems there's a bug in dustjs. The name of partials resolve to foo.dust
# instead of foo.dust.html. Here's a quick work-around.

pushd static/views
ls *html | sed -r s/.html// | xargs -I{} ln -s {}.html {}
