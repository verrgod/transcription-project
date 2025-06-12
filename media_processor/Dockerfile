FROM python:3.12

WORKDIR /app

COPY . . 

RUN pip install requests minio confluent_kafka && \
    pip install tritonclient[http] && \
    pip install pydub && \
    apt-get update && apt-get install -y ffmpeg && \
    pip install fastapi uvicorn[standard] python-multipart

EXPOSE 8080

CMD ["uvicorn", "media_processor:app", "--host", "0.0.0.0", "--port", "8080"]