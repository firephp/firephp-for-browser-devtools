#!/usr/bin/env bash

echo "Show info ..."

echo "node version: $(node --version)"
echo "npm version: $(npm --version)"

echo "Cloning ..."

git clone https://github.com/firephp/firephp-for-firefox-devtools.git firephp

pushd "firephp"

    git checkout amo

    echo "Installing ..."

    npm install

    echo "Building ..."

    npm run build

popd
