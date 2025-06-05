# Waits for minio uploads of media files and process them to vtt files
#!/usr/bin/env python
import json
import logging
import tritonclient.http as httpclient
import numpy as np 
from io import BytesIO
from minio import Minio
from minio.error import S3Error
from confluent_kafka import Consumer, Producer
from pydub import AudioSegment
from fastapi import FastAPI, File, UploadFile, APIRouter, HTTPException
from threading import Thread
from fastapi.middleware.cors import CORSMiddleware

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# In actual practice, this should be in environmental variables
# Configuration Variables
KAFKA_CONFIG = {
    'bootstrap.servers': 'kafka:9092',
    'group.id': 'kafka-python-getting-started',
    'auto.offset.reset': 'earliest',
    'security.protocol': 'PLAINTEXT',
}

MINIO_CONFIG = {
    'endpoint': 'minio-server:9000',
    'access_key': 'minio',
    'secret_key': 'minio123',
    'secure': False,
}

INFERENCE_URL = "http://triton:8000/v2/models/faster-whisper-large-v3/infer"

app = FastAPI()
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MinIO Client
minio_client = Minio(
    MINIO_CONFIG['endpoint'],
    access_key=MINIO_CONFIG['access_key'],
    secret_key=MINIO_CONFIG['secret_key'],
    secure=MINIO_CONFIG['secure']
)

def convert_to_wav_bytes(audio_bytes):
    audio = AudioSegment.from_file(BytesIO(audio_bytes), format=None)
    wav_io = BytesIO()
    audio.export(wav_io, format="wav")
    return wav_io.getvalue()

def setup_kafka_consumer():
    """Creates and returns a Kafka Consumer instance"""
    consumer = Consumer(KAFKA_CONFIG)
    logging.info("Kafka Consumer initialized.")
    return consumer

def setup_kafka_producer():
    """Creates and returns a Kafka Producer instance"""
    producer = Producer(KAFKA_CONFIG)
    logging.info("Kafka Producer initialized.")
    return producer

def retrieve_file_from_minio(bucket_name, file_name):
    """Retrieve file from MinIO and return its bytes"""
    try:
        response = minio_client.get_object(bucket_name, file_name)
        with response:
            return response.read()
    except Exception as e:
        logging.error(f"Failed to retrieve file from MinIO: {e}")
        return None

def run_inference(audio_bytes):
    wav_bytes = convert_to_wav_bytes(audio_bytes)
    audio_np = np.array([np.frombuffer(wav_bytes, dtype=np.uint8)])

    with httpclient.InferenceServerClient(url="triton:8000") as client:
        inputs = [
            httpclient.InferInput("AUDIO", audio_np.shape, "UINT8")
        ]
        inputs[0].set_data_from_numpy(audio_np)

        outputs = [
            httpclient.InferRequestedOutput("TRANSCRIPTION")
        ]

        response = client.infer(model_name="faster-whisper-large-v3", inputs=inputs, outputs=outputs)
        result = response.as_numpy("TRANSCRIPTION")[0].decode("utf-8")
        return result
    
def upload_to_minio(bucket_name, file_name, data, content_type):

    try:
        """Upload data to MinIO"""
        if not minio_client.bucket_exists(bucket_name):
            minio_client.make_bucket(bucket_name)
            logging.info(f"Bucket {bucket_name} created.")

        vtt_stream = BytesIO(data)
        minio_client.put_object(
            bucket_name,
            file_name,
            vtt_stream,
            len(data),
            content_type=content_type
        )
        logging.info(f"Uploaded {file_name} to {bucket_name}.")
    except S3Error as error:
        logging.error(f"MinIO upload error: {error}")
        raise

def process_message(message, producer):
    """Process a Kafka message"""
    records = message.get("Records", [])
    if not records:
        logging.warning("No Records found in Kafka message.")
        return

    record = records[0]
    bucket_name = record["s3"]["bucket"]["name"]
    file_name = record["s3"]["object"]["key"]

    logging.info(f"Processing file: {file_name} from bucket: {bucket_name}")

    audio_bytes = retrieve_file_from_minio(bucket_name, file_name)
    if audio_bytes:
        wav_bytes = convert_to_wav_bytes(audio_bytes)
        vtt_content = run_inference(wav_bytes)
        if vtt_content:
            dest_name = f'{file_name}.vtt'
            upload_to_minio('media-vtt', dest_name, vtt_content.encode('utf-8'), 'text/vtt')
            producer.produce("vtt-upload", 'testing', dest_name)
            producer.flush()
            logging.info(f"Produced event for {dest_name}")

def kafka_loop():
    """Main function to run the Kafka consumer loop"""
    consumer = setup_kafka_consumer()
    producer = setup_kafka_producer()
    topic = "minio-events-v1"
    consumer.subscribe([topic])

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                logging.info("Waiting for messages...")
                continue
            logging.info(f"📥 Raw Kafka message: {msg.value()}")

            if msg.error():
                logging.error(f"Consumer error: {msg.error()}")
                continue
            message = json.loads(msg.value())
            process_message(message, producer)
    except KeyboardInterrupt:
        logging.info("Shutting down...")
    finally:
        consumer.close()

@router.post("/upload")
def upload_file(file: bytes = File(...), filename: str = File(...)):
    try:
        upload_to_minio(
            bucket_name="media",
            file_name=filename,
            data=file,
            content_type="application/octet-stream"
        )
        return {"message": "File uploaded", "filename": filename} 
    except Exception as e:
        logging.exception("Upload failed")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.on_event("startup")
def startup_event():
    thread = Thread(target=kafka_loop, daemon=True)
    thread.start()

app.include_router(router)

