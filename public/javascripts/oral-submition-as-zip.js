document.getElementById('downloadZip').addEventListener('click', async () => {
  const audioElements = document.querySelectorAll('audio')
  const questions = document.querySelectorAll('#question')
  const audioUrls = Array.from(audioElements).map((audio) => audio.src)

  const zip = new JSZip()

  // Download each audio file and add it to the zip archive
  await Promise.all(
    audioUrls.map(async (url, index) => {
      const response = await fetch(url)
      const blob = await response.blob()
      
      zip.file(`${questions[index].textContent.split('?')[0]}.mp3`, blob)
    })
  )

  // Generate the zip file
  const content = await zip.generateAsync({ type: 'blob' })

  // Create a download link and trigger the download
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(content)
  // the last part of the url is the filename
  const submitionId = window.location.href.split('/')
  downloadLink.download = `submition_${submitionId[submitionId.length - 1]}.zip`
  downloadLink.click()
})
