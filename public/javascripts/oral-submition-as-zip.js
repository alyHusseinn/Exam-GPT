document.getElementById('downloadZip').addEventListener('click', async () => {
  const audioElements = document.querySelectorAll('audio')
  const questions = Array.from(document.querySelectorAll('#question')).map(
    (question) => question.textContent.split('?')[0]
  )
  const examTopic = document
    .querySelector('.exam_topic')
    .textContent.split(':')[1]
    .trim()
  const studentName = document
    .querySelector('.student_name')
    .textContent.split(':')[1]
    .trim()
  const audioUrls = Array.from(audioElements).map((audio) => audio.src)

  const zip = new JSZip()

  // Download each audio file and add it to the zip archive
  await Promise.all(
    audioUrls.map(async (url, index) => {
      // add https instead of http if it url strarts with http not https
      url = 'https://' + url.split('//')[1]
      const response = await fetch(url)
      const blob = await response.blob()

      zip.file(`${questions[index]}.mp3`, blob)
    })
  )

  // Generate the zip file
  const content = await zip.generateAsync({ type: 'blob' })

  // Create a download link and trigger the download
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(content)
  // the last part of the url is the filename
  const submitionId = window.location.href.split('/')
  downloadLink.download = `student_${studentName}_exam_${examTopic}_submissionID_${submitionId[submitionId.length - 1]}.zip`
  downloadLink.click()
})
