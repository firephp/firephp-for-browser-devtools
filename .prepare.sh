#!/usr/bin/env bash

# TODO: Get rid of this file once issues are fixed in underlying libraries.

[ ! -e '.~/gi0.PINF.it~build~v0' ] || rm -Rf '.~/gi0.PINF.it~build~v0'
[ ! -e 'dist/firephp.build' ] || rm -Rf 'dist/firephp.build'

[ -e '.~lib.json' ] || node_modules/.bin/lib.json from node_modules > '.~lib.json'
