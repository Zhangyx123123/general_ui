#!/bin/bash

COLOR_REST='\033[0m'
COLOR_RED='\033[0;31m'
COLOR_BOLD='\033[0;32m'
# build a image based on folder
function build_folder() {
    echo -e "${COLOR_BOLD}"
    printf '=%.0s' {1..15}
    printf "Building image from $1"
    printf '=%.0s' {1..15}
    printf '\n'
    echo -e "${COLOR_REST}"
    cd "$1" || exit 1
    # shellcheck source=/dev/null
    source ./build.env
    buildArg=""
    # Caputre the build-arg from var start with ARG_*
    for e in $(set -o posix ; set | less);
    do
        if [[ $e =~ ^ARG_* ]]; then
            buildArg="$buildArg --build-arg $e"
        fi
    done
    docker-compose -f $1/docker-compose.yml config
    #Build the image
    cmd="docker-compose -f $1/docker-compose.yml build $buildArg"

    echo "$cmd"
    eval "$cmd" || return 1
    
    #Run the Unit test of docker image
    case $2 in
    "docker")
        docker pull docker-reg.emotibot.com.cn:55688/container-structure-test:latest
        docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v "$1/test.yaml:/test.yaml" \
            docker-reg.emotibot.com.cn:55688/container-structure-test:latest test\
            --image "$IMAGE_NAME" \
            --config "/test.yaml" || return 1
        ;;
    "local")
        cmd="container-structure-test test --image $IMAGE_NAME --config test.yaml" 
        echo "$cmd"
        eval "$cmd" || return 1
        ;;
    "skip-test")
        echo "Test skipped"
        ;;
    *)
        echo -e "${COLOR_RED}unknow option${COLOR_REST}"
        ;;
    esac

    echo $IMAGE_NAME
    return 0
}