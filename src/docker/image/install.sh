#!/usr/bin/env bash

echo -e "\n########## START INSTALL ON DOCKER IMAGE ##########\n"

echo "VERBOSE: $VERBOSE"
echo "BO_VERBOSE: $BO_VERBOSE"

echo "Show info ..."

echo "node version: $(node --version)"
echo "npm version: $(npm --version)"

echo "Cloning ..."

git clone file:///source/.git firephp
#git clone https://github.com/firephp/firephp-for-firefox-devtools.git firephp

pushd "firephp"

    git checkout pre

    echo "Installing ..."

    npm install

    # TODO: Get rid of needing to run this.
    node_modules/.bin/lib.json from node_modules > .~lib.json

popd
