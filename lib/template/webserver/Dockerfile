FROM nginx:1.11.13-alpine

RUN apk update \
    && apk add bash

# Link nginx logs to stdout and stderr
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

RUN mkdir /webserver
RUN mkdir -p /usr/src/app/dist

# Copy these files into the image
ADD nginx.conf.template /etc/nginx/nginx.conf.template
ADD nginx.dist.conf.template /etc/nginx/nginx.dist.conf.template
ADD startup.sh /webserver/startup.sh
ADD docker-entrypoint.sh /webserver/docker-entrypoint.sh

# Make them executatble
RUN chmod a+x /webserver/startup.sh
RUN chmod a+x /webserver/docker-entrypoint.sh

ENTRYPOINT ["/webserver/docker-entrypoint.sh"]

# Write the domain to the nginx configuration file
CMD ["./webserver/startup.sh"]
