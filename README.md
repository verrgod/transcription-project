# This project is functional & currently in development.

## Pipeline
1. Multimedia object (audio or video) is pushed into a MinIO bucket
2. MinIO sends an event notification to a kafka topic A as a new message
3. Configure KSQL stream(s) to transform the message into a useful format, into another topic B
4. Separate application X (can be python) consumes messages from topic B, retrieves the object in MinIO and performs any necessary pre-processing
5. Application X then parses the pre-processed blob into an inference service and transform the post-processed data into a webVTT format (.vtt file) with the processed content (textual)
6. Application X then uploads the .vtt file into a MinIO bucket, and produces a message into kafka topic C

## Prototype
https://www.figma.com/design/OAoM0d5upK1dLSgjYPa8N4/audio-transcription-project?node-id=0-1&t=OEN05Yif2E4vwzQc-1

## Usage
docker compose up --build
(Give Triton some time to install onto server, takes a while)

Open MinIO as opened in port 9000.
Upload audio file (mp3, wav etc.)
New MinIO bucket created with .vtt file that includes transcription with timestamps. 

**Features**
- Audio transcription
- Playback w/ waveform display and audio controls
- Dynamic subtitling (wip)

