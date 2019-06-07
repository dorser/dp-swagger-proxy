FROM ibmcom/datapower:latest
ENV  DATAPOWER_WORKER_THREADS=4 \
     DATAPOWER_INTERACTIVE=true

COPY src/drouter /drouter

CMD ["/start.sh"]
