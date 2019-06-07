FROM ibmcom/datapower:latest
ENV  DATAPOWER_ACCEPT_LICENSE=true \
     DATAPOWER_WORKER_THREADS=4 \
     DATAPOWER_INTERACTIVE=true

COPY src/ /

EXPOSE 443

CMD ["/start.sh"]
