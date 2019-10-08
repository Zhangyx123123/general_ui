#!/bin/bash

urlencode() {
    # urlencode <string>
    old_lc_collate=$LC_COLLATE
    LC_COLLATE=C
    
    local length="${#1}"
    for (( i = 0; i < length; i++ )); do
        local c="${1:i:1}"
        case $c in
            [a-zA-Z0-9.~_-]) printf "$c" ;;
            *) printf '%%%02X' "'$c" ;;
        esac
    done
    
    LC_COLLATE=$old_lc_collate
}

RED="\033[31m";
YELLOW="\033[33m";
RESET="\033[0m";

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 relase_tag";
  exit 1;
fi

RELEASE_TAG=$1
if ! [[ "$RELEASE_TAG" =~ v[0-9]+.[0-9]+.[0-9]+ ]]; then
  echo "Release tag should be in format like v1.0.0";
  exit 1;
fi

git tag | grep $RELEASE_TAG > /dev/null
if [[ $? -eq 0 ]]; then
  echo -e $RED"Release tag: $RELEASE_TAG exist on belowing commit"$RESET;
  git show $RELEASE_TAG;
  exit 1;
fi

BRANCH=`git branch | grep \* | cut -d ' ' -f2`
if ! [[ "$BRANCH" == "development" ]]; then
  echo -e $RED"Release should process on development branch"$RESET;
  exit 1;
fi

LATEST_TAG=`git tag | grep 'v[0-9]\+\.[0-9]\+\.[0-9]\+' | sort -u | tail -n 1`;
RAW_LOG=`git log ${LATEST_TAG}..HEAD --pretty=tformat:"=====%n%an  %h%n%s%n%n%b %n%n"`;
BFOP_ISSUES=`echo $RAW_LOG | grep -o "BFOP-[0-9]\+" | paste -sd "," -`;
OTHER_ISSUES=`echo $RAW_LOG | grep -o "[A-Z]\+-[0-9]\+" | grep -v BFOP | paste -sd "," -`;

echo "API version" > ./.release_tmp;
cat docker/runtime/build.env | grep ARG | grep -v '\$' >> ./.release_tmp
echo "" >> ./.release_tmp;

echo "Release Note" >> ./.release_tmp;
echo -n "Fix bug in BFOP: " >> ./.release_tmp;
echo $BFOP_ISSUES >> ./.release_tmp;
echo -n "Fix bug in project: " >> ./.release_tmp;
echo $OTHER_ISSUES >> ./.release_tmp;
echo "" >> ./.release_tmp;

echo "Row Change List" >> ./.release_tmp;
git log ${LATEST_TAG}..HEAD --pretty=tformat:"=====%n%an  %h%n%s%n%n%b %n%n" >> ./.release_tmp;


echo -n "Fix bug in BFOP: ";
echo $BFOP_ISSUES;
echo -n "Fix bug in project: ";
echo $OTHER_ISSUES;
echo "Total commits: "`git rev-list $LATEST_TAG..HEAD --count`;
echo "Are you sure to release $RELEASE_TAG base on $LATEST_TAG ? (y/N)"
read GOON;
if ! [[ $GOON -eq "Y" ]] && ! [[ $GOON -eq "y" ]]; then
  echo "Abort";
  exit 0;
fi

RELEASE_BRANCH="release/$RELEASE_TAG";

echo -e $YELLOW"Create branch"$RESET;
git checkout -q -b $RELEASE_BRANCH;
if ! [[ $? -eq 0 ]]; then
  echo -e $RET"Create branch fail"$RESET;
  exit 1;
fi

echo -e $YELLOW"Push branch"$RESET;
git push -q origin $RELEASE_BRANCH;
if ! [[ $? -eq 0 ]]; then
  echo -e $RET"Push branch fail"$RESET;
  echo -e $YELLOW"Reset branch to development"$RESET;
  git checkout -q development;
  git branch -q -D $RELEASE_BRANCH;
  exit 1;
fi

cat .release_tmp | pbcopy
rm .release_tmp
echo "Release info is in clipboard, merge request page and wiki page will open after 3 second";
echo "http://wiki.emotibot.com:8090/x/sQqS";
sleep 3;

MR_URL="https://gitlab.emotibot.com/deployment/general-ui/merge_requests/new?merge_request%5Bsource_branch%5D="`urlencode $RELEASE_BRANCH`;
NEW_RELEASE_PAGE="http://wiki.emotibot.com:8090/pages/createpage.action?spaceKey=ENG&fromPageId=9570993"
open $MR_URL;
open $NEW_RELEASE_PAGE;
