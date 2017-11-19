#!/usr/bin/env bash

echo -e "\n########## START BUILD ON DOCKER IMAGE ##########\n"

echo "VERBOSE: $VERBOSE"
echo "BO_VERBOSE: $BO_VERBOSE"

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

#    echo "npm version: $(npm --version)"
#    npm i -g npm@5.5.0
#    echo "npm version: $(npm --version)"

#rm -Rf ~/.bash.origin.cache

    npm install

    echo "Building ..."

    npm run build

popd
