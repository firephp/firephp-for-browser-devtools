#!/usr/bin/env bash.origin.script

# TODO: Move to '#!inf.json' once pinf.it/build/v0 executes instructions in sequence.

pushd "dist/firephp.build" > /dev/null

    # Remove files that we do not need
    # TODO: Do this in a better way and coordinate with .gitignore
    rm -Rf scripts/devtools/dist/dist/riot.min.js
    rm -Rf scripts/devtools/dist/dist/riot.js
    rm -Rf scripts/devtools/dist/dist/babel-regenerator-runtime.js
    rm -Rf scripts/devtools/dist/dist/reps/insight.domplate.reps/dist/reps/dist/domplate.browser.js
    rm -Rf scripts/devtools/dist/dist/reps/insight.domplate.reps/dist/reps/dist/domplate-eval.browser.js
    rm -Rf lib/github.com~pinf~pinf-for-mozilla-web-ext/scripts/lib/pinf-loader-core.browser.js
    rm -Rf lib/github.com~pinf~pinf-for-mozilla-web-ext/scripts/lib/babel-regenerator-runtime.js
    rm -Rf scripts/devtools/dist/dist/reps/insight.domplate.reps/dist/reps/*/*.preview.htm
    rm -Rf scripts/devtools/dist/dist/reps/insight.domplate.reps/dist/reps/reps.json
    rm -Rf scripts/devtools/dist/dist/reps/io.shields.img.rep.js
    rm -Rf scripts/devtools/dist/dist/reps/div.rep.js
    rm -Rf scripts/devtools/dist/dist/reps/golden-layout.rep.js
    rm -Rf skin/box.png
    rm -Rf run.config.json

    # Remove signed archive as it needs to be re-signed
    rm -f ../firephp.build.xpi 2> /dev/null || true

popd > /dev/null

pushd "dist" > /dev/null

    mv firephp.build firephp
    zip -r firephp.zip firephp/
    mv firephp firephp.build

popd > /dev/null

BO_cecho "\nBuilt extension source can be found at: dist/firephp.build/" YELLOW BOLD
BO_cecho "This source can be loaded into a browser when running in extension development mode.\n" YELLOW BOLD
