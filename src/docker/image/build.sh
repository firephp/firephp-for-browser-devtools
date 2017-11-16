#!/usr/bin/env bash

echo -e "\n########## START BUILD ON DOCKER IMAGE ##########\n"


echo "Show info ..."

echo "node version: $(node --version)"
echo "npm version: $(npm --version)"

echo "Cloning ..."

git clone https://github.com/firephp/firephp-for-firefox-devtools.git firephp

pushd "firephp"

    git checkout amo

    echo "Installing ..."

    export VERBOSE=1
    export BO_VERBOSE=1

    npm install

    echo "Building ..."

    npm run build

popd
