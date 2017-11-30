#!/usr/bin/env bash

echo -e "\n########## START BUILD ON DOCKER IMAGE ##########\n"

echo "VERBOSE: $VERBOSE"
echo "BO_VERBOSE: $BO_VERBOSE"

echo "Show info ..."

echo "node version: $(node --version)"
echo "npm version: $(npm --version)"

echo "Cloning ..."

git clone https://github.com/firephp/firephp-for-firefox-devtools.git firephp

pushd "firephp"

    git checkout amo

    echo "Installing ..."

    npm install --unsafe-perm

    echo "Building ..."

    npm run build

popd
