#!/bin/bash
set -eu

COLOR_REST='\033[0m'
COLOR_RED='\033[0;31m'

if [ "$#" -ne 1 ]; then
    echo -e "${COLOR_RED}detect old build script way call, using compatible mode for skip-test ${COLOR_REST}"
    echo "Usage: build.sh test-option"
    echo "  test-option contains three options:"
    echo "      local: run container test from host, need install container-structure-test first"
    echo "      docker: run test with docker, only support linux version docker"
    echo "      skip-test: disable test, DO NOT RECOMMEND IN PRODUCTION LEVEL"
    
    TEST_OPTION="skip-test"
else
    TEST_OPTION=$1
fi
# if [ -z "$(git status --porcelain)" ]; then 
    # Working directory clean
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
# To force the variable scope within function, we fork a bash to run script.
bash -c "source $DIR/util.sh && build_folder $DIR/build $TEST_OPTION"

bash -c "source $DIR/util.sh && build_folder $DIR/runtime $TEST_OPTION"
# else 
#     # Uncommitted changes
#     echo -e "${COLOR_RED}Detect Uncommitted changes, please commit before you build${COLOR_REST}"
#     echo "$(git status --porcelain)"
#     exit 1
# fi
