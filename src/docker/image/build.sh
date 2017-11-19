#!/usr/bin/env bash

echo -e "\n########## START BUILD ON DOCKER IMAGE ##########\n"

export BO_VERSION_RECENT_NODE="9"
export BO_VERSION_NVM_NODE="9"

echo "Show info ..."

echo "node version: $(node --version)"
echo "npm version: $(npm --version)"

echo "Cloning ..."

git clone https://github.com/firephp/firephp-for-firefox-devtools.git firephp

pushd "firephp"

    git checkout amo

    echo "Installing ..."

#    export VERBOSE=1
#    export BO_VERBOSE=1

#    echo "npm version: $(npm --version)"
#    npm i -g npm@5.5.0
#    echo "npm version: $(npm --version)"

    npm install

    echo "Building ..."

    npm run build

popd
