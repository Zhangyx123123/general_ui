ARG ARG_node_base
FROM docker-reg.emotibot.com.cn:55688/general-node-base:${ARG_node_base}

# Build Context should be repo's top level
# ADD . build

ADD build build/build
ADD config build/config
ADD static build/static
ADD src build/src
ADD .babelrc .postcssrc.js .eslintrc.js .eslintignore login.html index.html version.html package.json build/
RUN cd build && npm install --production && npm run build
