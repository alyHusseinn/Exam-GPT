let mediaRecorders = []
let recordedChunks = []

const form = document.querySelector('.exam-form')

let submitted = false
const submitButton = document.querySelector(
  `.exam-form > button[type="submit"]`
)

form.addEventListener('submit', (e) => {
  if (!submitted) {
    submitButton.disabled = true
    submitButton.innerText = 'sending...'
    submitted = true
  }
})

// Make a timer and submit the form after it reaches 0
const durationElement = document.getElementById('duration')

function startTimer(duration, display) {
  let timer = duration,
    minutes,
    seconds

  const intervalId = setInterval(function () {
    minutes = parseInt(timer / 60, 10)
    seconds = parseInt(timer % 60, 10)

    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    display.textContent = minutes + ':' + seconds + ' Minutes'

    if (--timer < 0) {
      clearInterval(intervalId)
      submitButton.click()
    }
  }, 1000)
}

// Assuming the initial duration is in the format "mm:ss"
const initialDuration = durationElement.textContent.split(':')
const durationInSeconds =
  parseInt(initialDuration[0], 10) * 60 + parseInt(initialDuration[1], 10)

startTimer(durationInSeconds, durationElement)

function toggleRecording(index) {
  const button = document.getElementById(`recordButton${index}`)
  const isRecording = button.dataset.recording === 'true'

  if (isRecording) {
    mediaRecorders[index - 1].stop()
    button.innerText = `Start Recording`
    button.dataset.recording = 'false'
    button.style = 'background-color: black'
  } else {
    mediaRecorders.forEach((recorder, idx) => {
      if (idx !== index - 1) {
        recorder.stop()
        document.getElementById(`recordButton${idx + 1}`).dataset.recording =
          'false'
        document.getElementById(`recordButton${idx + 1}`).innerText =
          `Start Recording`
        document.getElementById(`recordButton${idx + 1}`).style =
          'background-color: black'
      }
    })
    startRecording(index)
    button.innerText = 'Stop Recording'
    button.dataset.recording = 'true'
    button.style = 'background-color: green'
    document.getElementById(`audioPlayer${index}`).style.display = 'none'
  }
}

function startRecording(index) {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (stream) {
      mediaRecorders[index - 1] = new MediaRecorder(stream)

      mediaRecorders[index - 1].ondataavailable = function (event) {
        recordedChunks[index - 1] = event.data
      }

      mediaRecorders[index - 1].onstop = function () {
        const audioBlob = new Blob([recordedChunks[index - 1]], {
          type: 'audio/wav'
        })
        const audioUrl = URL.createObjectURL(audioBlob)
        const audioPlayer = document.getElementById(`audioPlayer${index}`)
        audioPlayer.src = audioUrl
        audioPlayer.style.display = 'block'
      }

      recordedChunks[index - 1] = []
      mediaRecorders[index - 1].start()
    })
    .catch(function (err) {
      console.error('Error accessing microphone:', err)
    })
}
function playRecording(index) {
  const audioPlayer = document.getElementById(`audioPlayer${index}`)
  audioPlayer.play()
}

function downloadRecording(index) {
  const audioBlob = new Blob([recordedChunks[index - 1]], {
    type: 'audio/wav'
  })
  const url = URL.createObjectURL(audioBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recording${index}.wav`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 0)
}

function submitForm(event) {
  event.preventDefault()
  // extract the :id of exam/id out of the url
  const url = window.location.pathname
  const id = url.substring(url.lastIndexOf('/') + 1)
  const formData = new FormData(document.getElementById('voiceForm'))

  recordedChunks.forEach((chunk, index) => {
    formData.append('voices', new Blob([chunk], { type: 'audio/wav' }))
    formData.append('voiceIndexes', index)
  })

  fetch(`/oralexam/${id}/submit`, {
    method: 'POST',
    body: formData
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      console.log('Form data sent successfully')
      setTimeout(() => {
        window.location.href = '/home'
      }, 3000)
    })
    .catch((error) => {
      console.error(
        'There was a problem with sending the form data:',
        error.message
      )
      alert(
        'There was a problem with sending the form data. Please try again later.'
      )
      setTimeout(() => {
        window.location.href = '/home'
      }, 3000)
    })
}