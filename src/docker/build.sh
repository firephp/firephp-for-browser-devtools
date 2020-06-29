#!/usr/bin/env bash.origin.script

if ! BO_if_os "osx"; then
	BO_exit_error "You are not on macOS!"
fi

depend {
    "docker": {
		"bash.origin.docker # runner/v0": "localhost"
	}
}

pushd "$__DIRNAME__/image" > /dev/null

	echo "Building docker image ..."

	[ ! -e ".~source" ] || rm -Rf ".~source"
	cp -Rf ../../../.git .~source

	# CALL_docker build . "firephp-for-firefox-devtools" --no-cache
	CALL_docker build . "firephp-for-firefox-devtools"

	echo "Running docker image ..."

	[ -e ../../../dist/firephp.build-docker ] || mkdir ../../../dist/firephp.build-docker

#	CALL_docker run "firephp-for-firefox-devtools" 8080 --mount "src=$(pwd)/../../../dist/firephp.build-docker,target=/firephp/dist/firephp.build,type=bind"
	CALL_docker run "firephp-for-firefox-devtools"

popd > /dev/null

