#!/bin/bash
set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# To force the variable scope within function, we fork a bash to run script.
echo "---Building base image---"
bash -c "source $DIR/util.sh && build_folder $DIR/base"