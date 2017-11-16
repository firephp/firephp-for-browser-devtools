#!/usr/bin/env bash

echo "Cloning ..."

git clone git@github.com:firephp/firephp-for-firefox-devtools.git firephp

pushd "firephp"

    git checkout amo

    echo "Installing ..."

    npm install

    echo "Building ..."

    npm run build

popd
