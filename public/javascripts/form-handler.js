const form = document.querySelector('.exam-form')
const submitButton = document.querySelector(
  `.exam-form button[type="submit"]`
)
const submitted = false

form.addEventListener('submit', function (event) {
  if (!submitted) {
    submitButton.disabled = true
    submitButton.innerText = 'sending...'
    submitted = true
  }
})

// Make a timer and submit the form after it reaches 0
const durationElement = document.getElementById('duration');

function startTimer(duration, display) {
  let timer = duration, minutes, seconds;
  
  const intervalId = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    display.textContent = minutes + ':' + seconds + ' Minutes';

    if (--timer < 0) {
      clearInterval(intervalId);
      form.submit();
    }
  }, 1000);
}

// Assuming the initial duration is in the format "mm:ss"
const initialDuration = durationElement.textContent.split(':');
const durationInSeconds = parseInt(initialDuration[0], 10) * 60 + parseInt(initialDuration[1], 10);

startTimer(durationInSeconds, durationElement);
