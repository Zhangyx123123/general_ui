#!/bin/bash
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source ${DIR}/../docker/runtime/build.env

TS=`date +%s`
DIFF=`git log -r ${GIT_PREVIOUS_SUCCESSFUL_COMMIT}..${GIT_COMMIT} --pretty=format:"### %h(%an) - %s"| sed -e 's/"/-/g' | tr -d '\011\012\015'`

COLOR="#E06064"
TITLE="Build fail"
if [[ $1 == "success" ]];
then
  COLOR="#36a64f";
  TITLE="Build success"
fi

curl -k -X POST \
  http://192.168.3.84:5521/slack \
  -H 'Authorization: Bearer xoxp-34036332497-62774160423-298721146950-3073151d21b721a34177bae210b8bb74' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: d231d034-cd96-2d0c-50eb-2192875fa32f' \
  -d "{
  \"username\": \"出錯追殺者\",
  \"channel\": \"cicd\",
  \"icon_url\": \"https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-01-10/297462671574_a17ef962a0e918d04820_72.png\",
  \"attachments\": [
    {
      \"pretext\": \"build general-emotibot-ui result (<${BUILD_URL}|build link>)\",
      \"color\": \"${COLOR}\",
      \"author_name\": \"Docker builder\",
      \"author_link\": \"http://jenkins.emotibot.com:8080/job/FrontendTaipei/job/emotigo/\",
      \"title\": \"${TITLE} testing\",
      \"footer\": \"jenkins CI\",
      \"fields\": [
        {
          \"title\": \"TAG\",
          \"value\": \"${TAG}\",
          \"short\": true
        },
        {
          \"title\": \"Branch\",
          \"value\": \"${BRANCH_NAME}\",
          \"short\": true
        },
        {
          \"title\": \"Changes\",
          \"value\": \"${DIFF}\",
          \"short\": false
        }
      ],
      \"footer_icon\": \"https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-01-10/297462671574_a17ef962a0e918d04820_72.png\",
      \"ts\": ${TS}
    }
  ]
}"
