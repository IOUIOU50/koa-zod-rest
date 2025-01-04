#!/bin/sh

tar \
--exclude='./node_modules' \
--exclude='./test' \
--exclude='./.nvmrc' \
--exclude='./.prettierrc' \
--exclude='./.tar-gz.sh' \
--exclude='./lib' \
-czvf koa-zod-rest.tar.gz .