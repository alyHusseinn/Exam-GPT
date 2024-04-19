let mediaRecorders = [];
let recordedChunks = [];

function toggleRecording(index) {
    const button = document.getElementById(`recordButton${index}`);
    const isRecording = button.dataset.recording === 'true';

    if (isRecording) {
        mediaRecorders[index - 1].stop();
        button.innerText = `Start Recording`;
        button.dataset.recording = 'false';
    } else {
        mediaRecorders.forEach((recorder, idx) => {
            if(idx !== index - 1) {
                recorder.stop();
                document.getElementById(`recordButton${idx + 1}`).dataset.recording = 'false';
                document.getElementById(`recordButton${idx + 1}`).innerText = `Start Recording`;
            }
        });
        startRecording(index);
        button.innerText = 'Stop Recording';
        button.dataset.recording = 'true';
    }
}

function startRecording(index) {
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
        mediaRecorders[index - 1] = new MediaRecorder(stream);

        mediaRecorders[index - 1].ondataavailable = function(event) {
            recordedChunks[index - 1] = event.data;
        };

        mediaRecorders[index - 1].onstop = function() {
            const audioBlob = new Blob([recordedChunks[index - 1]], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioPlayer = document.getElementById(`audioPlayer${index}`);
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = 'block';
            const downloadButton =document.getElementById(`downloadButton${index}`);
            downloadButton.style.display = "block";
        };

        recordedChunks[index - 1] = [];
        mediaRecorders[index - 1].start();
    })
    .catch(function(err) {
        console.error('Error accessing microphone:', err);
    });
}
function playRecording(index) {
    const audioPlayer = document.getElementById(`audioPlayer${index}`);
    audioPlayer.play();
}

function downloadRecording(index) {
  const audioBlob = new Blob([recordedChunks[index - 1]], {
    type: "audio/wav",
  });
  const url = URL.createObjectURL(audioBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `recording${index}.wav`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

function submitForm(event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('voiceForm'));
    recordedChunks.forEach((chunk, index) => {
        formData.append(`voice${index + 1}`, new Blob([chunk], { type: 'audio/wav' }));
    });

    fetch('/submit', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Form data sent successfully');
    })
    .catch(error => {
        console.error('There was a problem with sending the form data:', error.message);
    });
}