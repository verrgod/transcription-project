import numpy as np
import triton_python_backend_utils as pb_utils
from faster_whisper import WhisperModel
from pydub import AudioSegment
import io

class TritonPythonModel:
    def initialize(self, args):
            self.model = WhisperModel("large-v3")

    def execute(self, requests):
        responses = []
        for request in requests:
            input_tensor = pb_utils.get_input_tensor_by_name(request, "AUDIO")
            audio_data = input_tensor.as_numpy()[0].tobytes()
            audio = AudioSegment.from_file(io.BytesIO(audio_data))

            # Save audio to temp file
            wav_path = "/tmp/input.wav"
            audio.export(wav_path, format="wav")

            segments, _ = self.model.transcribe(wav_path)
            full_text = " ".join([segment.text for segment in segments])
            output_tensor = pb_utils.Tensor("TRANSCRIPTION", np.array([full_text.encode('utf-8')], dtype=np.bytes_))
            responses.append(pb_utils.InferenceResponse(output_tensors=[output_tensor]))
        return responses

    def finalize(self): pass
