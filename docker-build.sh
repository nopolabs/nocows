#!/usr/bin/env bash

WORKDIR=/home/gradle/project
IMAGE=gradle:jdk16-openj9
CMD="${*:-gradle bootJar}"

set -ex

docker run --rm --user=gradle --volume="$PWD":"$WORKDIR" --workdir="$WORKDIR" "$IMAGE" $CMD
