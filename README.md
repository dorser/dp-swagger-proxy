# DataPower Swagger Proxy (Swagger Validator for IBM DataPower)

IBM DataPower doesn't support validating REST API calls against a swagger document out-of-the-box (Unless you have IBM API Connect).
This project exposes REST APIs using swaggers on a sinle Multi Protcol Gateway.

This means you can simply upload your swaggers to the designated directory and get it exposed and schema validated immediately.

# Building
You can start by building the docker image and run it.
`git clone https://github.com/dorser/dp-swagger-proxy.git`
`cd dp-swagger-proxy`
`docker build -t dorser/apigw:1.0 .`
`docker start --name apigw -p 15000:15000 -e DATAPOWER_ACCEPT_LICENSE=true dorser/apigw:1.0`
