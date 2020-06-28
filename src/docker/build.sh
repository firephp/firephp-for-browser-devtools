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

	CALL_docker build . "firephp-for-firefox-devtools"

	echo "Running docker image ..."

	CALL_docker run "firephp-for-firefox-devtools"

popd > /dev/null

