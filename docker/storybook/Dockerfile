FROM docker-reg.emotibot.com.cn:55688/general-node-base:20181023-1542-cf45d04

ADD . build

#ADD build build/build
#ADD config build/config
#ADD static build/static
#ADD src build/src
#ADD docker/storybook/entrypoint.sh build/entrypoint.sh
#ADD .babelrc .postcssrc.js .eslintrc.js .eslintignore login.html index.html version.html package.json build/
WORKDIR /build
ENTRYPOINT ["npm", "run", "storybook"]
