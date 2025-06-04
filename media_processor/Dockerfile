FROM python:3.12

ADD media_processor.py .

RUN pip install requests minio confluent_kafka && \
    pip install tritonclient[http] && \
    pip install pydub && \
    apt-get update && apt-get install -y ffmpeg && \
    pip install fastapi uvicorn[standard] python-multipart

CMD ["python", "./media_processor.py"]