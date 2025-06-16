import numpy as np
import triton_python_backend_utils as pb_utils
from faster_whisper import WhisperModel
from pydub import AudioSegment
import io
import logging

logging.basicConfig(level=logging.DEBUG)

class TritonPythonModel:
    def initialize(self, args):
        self.model = WhisperModel("large-v3", device="cpu", compute_type="int8")

    def execute(self, requests):
        responses = []
        for request in requests:
            try:
                input_tensor = pb_utils.get_input_tensor_by_name(request, "AUDIO")
                audio_data = input_tensor.as_numpy().tobytes()
                logging.debug(f"Audio data length: {len(audio_data)} bytes")

                audio = AudioSegment.from_file(io.BytesIO(audio_data), format=None)
                duration_seconds = len(audio) / 1000

                wav_io = io.BytesIO()
                audio.export(wav_io, format="wav")
                wav_io.seek(0)

                segments, _ = self.model.transcribe(wav_io, language="en", beam_size=5)

                # text 
                vtt_lines = []
                for i, segment in enumerate(segments):
                    start = self.format_timestamp(segment.start)
                    end = self.format_timestamp(segment.end)
                    text = segment.text.strip()
                    vtt_lines.append(f"{start} {text}")
                vtt_content = "\n".join(vtt_lines)

                # waveform
                audio_samples = np.array(audio.get_array_of_samples())
                downsample_factor = 100
                waveform =  audio_samples[::downsample_factor].tolist()

                vtt_tensor = pb_utils.Tensor("TRANSCRIPTION", np.array([vtt_content.encode('utf-8')], dtype=np.bytes_))
                waveform_tensor = pb_utils.Tensor("WAVEFORM", np.array(waveform, dtype=np.int16))
                duration_tensor = pb_utils.Tensor("DURATION", np.array([duration_seconds], dtype=np.float32))
                responses.append(pb_utils.InferenceResponse(output_tensors=[vtt_tensor, waveform_tensor, duration_tensor]))

            except Exception as e:
                logging.exception("Error in audio processing")
                raise
        return responses
     
    def format_timestamp(self, seconds: float) -> str:
        # Format time as M:SS for WebVTT
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        return f"{m}:{s:02}"

    def finalize(self):
        pass