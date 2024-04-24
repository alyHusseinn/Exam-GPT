const form = document.querySelector('.exam-form')
const submitButton = document.querySelector(
  `.exam-form button[type="submit"]`
)
const submited = false

form.addEventListener('submit', function (event) {
  if (!submited) {
    submitButton.disabled = true
    submitButton.innerText = 'sending...'
    submited = true
  }
})
