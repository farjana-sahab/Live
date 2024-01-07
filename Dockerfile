FROM tiangolo/nginx-rtmp
# FROM nginx:1.22


RUN apt-get update && apt-get install --fix-missing && apt-get install -y ffmpeg 

RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash

COPY script.sh /tmp/script/script.sh

RUN chown -R nobody:root /tmp/

RUN chmod +x /tmp/script/script.sh
COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /www/

COPY stat.xsl /tmp/
# COPY mc /tmp/script/
# RUN chmod +x /tmp/script/mc

COPY rec /tmp/rec/


EXPOSE 1935
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]