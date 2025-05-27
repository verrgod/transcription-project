FROM python:3.12

ADD media_processor.py .

RUN pip install requests minio confluent_kafka && \
    pip install tritonclient[http] && \
    pip install pydub && \
    apt-get update && apt-get install -y ffmpeg

CMD ["python", "./media_processor.py"]