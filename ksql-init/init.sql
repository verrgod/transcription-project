CREATE STREAM minio_media_events (
    eventName STRING,
    key STRING,
    records ARRAY<STRUCT<
        eventTime STRING,
        eventName STRING,
        s3 STRUCT<
            bucket STRUCT<name STRING>,
            object STRUCT<
                key STRING,
                `size` BIGINT,
                contentType STRING
            >
        >
    >>
) WITH (
    KAFKA_TOPIC = 'minio-events-v1',
    VALUE_FORMAT = 'JSON'
);

CREATE STREAM transformed_media_events WITH (
    KAFKA_TOPIC = 'transformed-minio-events',
    VALUE_FORMAT = 'JSON',
    PARTITIONS = 1
) AS
SELECT
    eventName,
    records[1]->eventTime AS event_time,
    records[1]->s3->bucket->name AS bucket_name,
    records[1]->s3->object->key AS file_name,
    records[1]->s3->object->`size` AS object_size,
    records[1]->s3->object->contentType AS content_type
FROM minio_media_events;