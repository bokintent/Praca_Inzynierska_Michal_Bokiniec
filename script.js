function addAudio() {
    const container = document.getElementById('audioContainer');
    const newAudioContainer = document.createElement('div');
  
    newAudioContainer.innerHTML = `
    <div class="track-container">
    <button class="button" id="startRecording">Nagrywanie</button>
    <button class="button" id="stopRecording" disabled>Zakończ</button>
    <audio class="audio-player" id="audioPlayer" controls></audio>
    <button class="button" onclick="removeAudio(this.parentElement)">Usuń</button>
    <button class="button" class="downloadButton" onclick="downloadTrack('audioPlayer')">Pobierz ścieżkę</button>
    `;
  
    container.appendChild(newAudioContainer);
  
    const startRecordingButton = newAudioContainer.querySelector('#startRecording');
    const stopRecordingButton = newAudioContainer.querySelector('#stopRecording');
    const audioPlayer = newAudioContainer.querySelector('#audioPlayer');
    let mediaRecorder;
    let audioChunks = [];
  
    startRecordingButton.addEventListener('click', () => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorder = new MediaRecorder(stream);
  
          mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
          });
  
          mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
          });
  
          mediaRecorder.start();
          startRecordingButton.disabled = true;
          stopRecordingButton.disabled = false;

          playAllRecordings();
        });
    });
  
    stopRecordingButton.addEventListener('click', () => {
      mediaRecorder.stop();
      startRecordingButton.disabled = false;
      stopRecordingButton.disabled = true;
    });
  }
function playAllRecordings() {
   const audioElements = document.querySelectorAll('audio');
     audioElements.forEach(audioElement => {
      if (!audioElement.paused) {
        audioElement.pause();
      }
      audioElement.currentTime = 0;
      audioElement.play();
    });
  } 
function removeAudio(container) {
   container.remove();
 }
function uploadAudio() {
   const fileInput = document.getElementById('fileInput');
   const container = document.getElementById('audioContainer');
   const newAudioContainer = document.createElement('div');
  
   const file = fileInput.files[0];
   if (file) {
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = URL.createObjectURL(file);
  
    newAudioContainer.appendChild(audioElement);
  
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Usuń';
    deleteButton.onclick = function() {
      newAudioContainer.remove();
    };
    newAudioContainer.appendChild(deleteButton);
  
    container.appendChild(newAudioContainer);
  }
}
function downloadAudio() {
  const audioElements = document.querySelectorAll('audio');
  const audioContext = new AudioContext();
  const gainNode = audioContext.createGain();

  audioElements.forEach(audioElement => {
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(gainNode);
  });

  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0.5;

  const destination = audioContext.createMediaStreamDestination();
  gainNode.connect(destination);

  const recorder = new MediaRecorder(destination.stream);
  const audioChunks = [];

  recorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };

  recorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = audioUrl;
    downloadLink.download = 'combined_audio.wav';
    downloadLink.click();
  };

  recorder.start();
  recorder.stop();
}

function downloadTrack(audioId) {
  const audioElement = document.getElementById(audioId);
  const audioUrl = audioElement.src;

  const downloadLink = document.createElement('a');
  downloadLink.href = audioUrl;
  downloadLink.download = `${audioId}.wav`;
  downloadLink.click();
}

document.addEventListener('DOMContentLoaded', () => {
  const startRecordingButton = document.getElementById('startRecording');
  const stopRecordingButton = document.getElementById('stopRecording');
  const audioPlayer = document.getElementById('audioPlayer');
  const saveProjectButton = document.getElementById('saveProject');
  const loadProjectButton = document.getElementById('loadProject');
  const saveButton = document.getElementById('saveButton');
  let mediaRecorder;
  let audioChunks = [];

  

  saveProjectButton.addEventListener('click', async () => {
    const projectName = prompt('Podaj nazwę projektu:');
    if (projectName) {
      const projectData = { nazwa: projectName, sciezki: audioChunks.map(chunk => URL.createObjectURL(new Blob([chunk], { type: 'audio/wav' }))) };
      try {
        await fetch('/saveAudioData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(projectData)
        });
        alert('Projekt został zapisany!');
      } catch (error) {
        console.error('Błąd podczas zapisywania projektu:', error);
        alert('Wystąpił błąd podczas zapisywania projektu.');
      }
    }
  });

  saveButton.addEventListener('click', () => {
    const saveInput = document.getElementById('saveInput');
    const saveText = saveInput.value;

   

    saveInput.value = ''; 
  });


  loadProjectButton.addEventListener('click', async () => {
    try {
      const response = await fetch('/projects');
      const projects = await response.json();
      if (projects.length > 0) {
        const lastProject = projects[projects.length - 1];
        audioChunks = lastProject.sciezki.map(sciezka => new Blob([sciezka], { type: 'audio/wav' }));
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioUrl;
        alert(`Wczytano ostatni projekt: ${lastProject.nazwa}`);
      } else {
        alert('Brak zapisanych projektów.');
      }
    } catch (error) {
      console.error('Błąd podczas wczytywania projektu:', error);
      alert('Wystąpił błąd podczas wczytywania projektu.');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const saveButton = document.getElementById('saveButton');

  saveButton.addEventListener('click', async () => {
    const audioElements = document.querySelectorAll('audio');

    const audioData = [];
    audioElements.forEach(audioElement => {
      const audioUrl = audioElement.src;
      const audioName = audioElement.id;

      audioData.push({ name: audioName, url: audioUrl });
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