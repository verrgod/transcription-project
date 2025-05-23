import numpy as np
import triton_python_backend_utils as pb_utils
from faster_whisper import WhisperModel

class TritonPythonModel:
    def initialize(self, args):
            self.model = WhisperModel("large-v3")

    def execute(self, requests):
        responses = []
        for request in requests:
            input_tensor = pb_utils.get_input_tensor_by_name(request, "AUDIO")
            audio_data = input_tensor.as_numpy().tobytes()

            # Save audio to temp file
            with open("/tmp/input.wav", "wb") as f:
                f.write(audio_data)

            segments, _ = self.model.transcribe("/tmp/input.wav")
            full_text = " ".join([segment.text for segment in segments])
            output_tensor = pb_utils.Tensor("TRANSCRIPTION", np.array([full_text.encode('utf-8')], dtype=np.bytes_))
            responses.append(pb_utils.InferenceResponse(output_tensors=[output_tensor]))
        return responses

    def finalize(self): pass
