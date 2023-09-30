document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveButton');
  
    saveButton.addEventListener('click', async () => {
      const audioElements = document.querySelectorAll('audio');
  
      const audioData = [];
      audioElements.forEach(audioElement => {
        const audioUrl = audioElement.src;
        const audioName = audioElement.id;
  
        fetch(audioUrl)
          .then(response => response.blob())
          .then(audioBlob => {
            audioData.push({ name: audioName, blob: audioBlob });
          })
          .catch(error => {
            console.error('Błąd podczas pobierania danych audio:', error);
          });
      });
  
  
      try {
        const response = await fetch('/saveAudioData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audioData }),
        });
  
        const result = await response.json();
        if (result.success) {
          alert('Dane audio zostały zapisane na serwerze.');
        } else {
          alert('Wystąpił błąd podczas zapisywania danych audio.');
        }
      } catch (error) {
        console.error('Błąd podczas wysyłania danych audio:', error);
        alert('Wystąpił błąd podczas wysyłania danych audio.');
      }
    });
  });