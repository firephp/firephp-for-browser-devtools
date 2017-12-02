#!/usr/bin/env bash

echo -e "\n########## START BUILD ON DOCKER IMAGE ##########\n"

echo "VERBOSE: $VERBOSE"
echo "BO_VERBOSE: $BO_VERBOSE"

echo "Show info ..."

echo "node version: $(node --version)"
echo "npm version: $(npm --version)"

pushd "firephp"

    echo "Building ..."

    npm run build

    echo "### DIFF ###"

    git diff

popd
