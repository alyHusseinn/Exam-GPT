let mediaRecorders = []
let recordedChunks = []

const form = document.querySelector('.exam-form')

const submitted = false
const submitButton = document.querySelector(
  `.exam-form > button[type="submit"]`
)

form.addEventListener('submit', (e) => {
  const divCount = document.querySelectorAll('form > div').length
  if (!submitted && recordedChunks.length == divCount) {
    submitButton.disabled = true
    submitButton.innerText = 'sending...'
    submitted = true
  }
})
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
    formData.append('voice', new Blob([chunk], { type: 'audio/wav' }))
  })

  // get the number of div in the form
  const divCount = document.querySelectorAll('form > div').length

  // check if the number of div is equal to the number of recordedChunks
  if (divCount !== recordedChunks.length) {
    alert(
      `Please record all the questions before submitting. divCount: ${divCount}, recordedChunks.length: ${recordedChunks.length}`
    )
    return
  }

  fetch(`/oralexam/${id}/submit`, {
    method: 'POST',
    body: formData
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      console.log('Form data sent successfully')
      // update the dom with success message
      document.querySelector('form').style.display = 'none'
      const successMessage = document.createElement('p')
      successMessage.textContent = 'Form data sent successfully'
      successMessage.style.color = 'green'
      successMessage.style.textAlign = 'center'
      successMessage.style.fontSize = '2rem'

      document.body.appendChild(successMessage)
      setTimeout(() => {
        document.body.removeChild(successMessage)
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
