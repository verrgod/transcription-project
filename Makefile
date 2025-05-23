.PHONY: all wait run-infrastructure kafka-create-topic minio-config-update kafka-event-consumer-run run-ksqldb down
all: run-infrastructure wait kafka-create-topic minio-config-update run-ksqldb

# sleep for 20 secs
# warm up containers
wait:
	sleep 20
## infrastructure: zookeeper kafka minio-server
run-infrastructure:
	docker-compose up -d kafka minio-server
run-ksqldb:
	docker-compose up -d ksqldb-server ksqldb-cli
## create kafka topic using decouple-kafka-broker
kafka-create-topic:
	docker-compose up kafka-setup
## config update done via minio-client (mc)
minio-config-update:
	docker-compose up mc
## run event-consumer
kafka-event-consumer-run:
	docker-compose up event-consumer
## down all containers
down:
	docker-compose down