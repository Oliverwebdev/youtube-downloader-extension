document.getElementById('downloadButton').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      var activeTabUrl = activeTab.url;
  
      var statusDiv = document.getElementById('status');
      statusDiv.innerText = 'Download wurde gestartet...';
  
      fetch('http://localhost:5000/download', { // Stelle sicher, dass dies die richtige URL ist
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: activeTabUrl })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        statusDiv.innerText = 'Konvertiere Sound...';
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'audio.mp3';
        if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
          const matches = /filename="([^"]*)"/.exec(contentDisposition);
          if (matches != null && matches[1]) { 
            filename = matches[1];
          }
        }
        return response.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        statusDiv.innerText = 'Download wird gestartet...';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename; // Verwende den vom Server gelieferten Dateinamen
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        statusDiv.innerText = 'Download abgeschlossen!';
      })
      .catch(error => {
        console.error('Fetch Error:', error); // Debug-Ausgabe
        statusDiv.innerText = 'Netzwerkfehler: ' + error;
      });
    });
  });
  