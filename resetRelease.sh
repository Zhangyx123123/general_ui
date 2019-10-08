#!/bin/bash

BRANCH=`git branch | grep \* | cut -d ' ' -f2`;
if ! [[ "$BRANCH" =~ release\/v[0-9]+.[0-9]+.[0-9]+ ]]; then
  echo -e $RED"This script should process on release/v*.*.* branch"$RESET;
  exit 1;
fi

git checkout development && git branch -D $BRANCH && git push -d origin $BRANCH;