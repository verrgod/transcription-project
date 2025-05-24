FROM nvcr.io/nvidia/tritonserver:24.12-vllm-python-py3
RUN apt-get update && apt-get install -y ffmpeg && \
    pip3 install faster-whisper && \
    pip3 install pydub && \ 
    pip3 install numpy

