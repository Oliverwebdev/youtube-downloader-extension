# YouTube to MP3 Downloader Chrome Extension

Dies ist eine Chrome-Erweiterung, die YouTube-Videos in MP3-Dateien umwandelt und herunterlädt. Sie besteht aus einem Flask-Backend und einer einfachen HTML/JavaScript-Benutzeroberfläche.

## Voraussetzungen

- Python 3.x
- Flask
- yt-dlp
- FFmpeg
- Google Chrome

## Installation

### Backend (Flask-Anwendung)

1. **Klonen Sie das Repository:**

    ```bash
    git clone https://github.com/Oliverwebdev/youtube-downloader-extension.git
    cd youtube-downloader-extension
    ```

2. **Erstellen Sie eine virtuelle Umgebung und aktivieren Sie sie:**

    ```bash
    python -m venv venv
    source venv/bin/activate  # Auf Windows: venv\Scripts\activate
    ```

3. **Installieren Sie die erforderlichen Python-Bibliotheken:**

    ```bash
    pip install -r requirements.txt
    ```

4. **Stellen Sie sicher, dass FFmpeg installiert ist:**

    - Auf macOS: `brew install ffmpeg`
    - Auf Ubuntu: `sudo apt-get install ffmpeg`
    - Auf Windows: [FFmpeg Download](https://ffmpeg.org/download.html)

5. **Starten Sie den Flask-Server:**

    ```bash
    python app.py
    ```

    Der Server läuft jetzt auf `http://localhost:5000`.

### Chrome-Erweiterung

1. **Erstellen Sie die notwendigen Dateien:**

    - `manifest.json`
    - `popup.html`
    - `popup.js`

2. **Inhalt von `manifest.json`:**

    ```json
    {
      "manifest_version": 2,
      "name": "YouTube to MP3 Downloader",
      "version": "1.0",
      "description": "Download YouTube videos as MP3 files",
      "permissions": [
        "activeTab"
      ],
      "browser_action": {
        "default_popup": "popup.html",
        "default_icon": {
          "16": "icon.png",
          "48": "icon.png",
          "128": "icon.png"
        }
      }
    }
    ```

3. **Inhalt von `popup.html`:**

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <title>YouTube to MP3</title>
      <style>
        body { width: 200px; }
        button { width: 100%; padding: 10px; margin-top: 10px; }
        #status { margin-top: 10px; }
      </style>
    </head>
    <body>
      <button id="downloadButton">Download as MP3</button>
      <div id="status"></div>
      <script src="popup.js"></script>
    </body>
    </html>
    ```

4. **Inhalt von `popup.js`:**

    ```javascript
    document.getElementById('downloadButton').addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var activeTab = tabs[0];
          var activeTabUrl = activeTab.url;
      
          var statusDiv = document.getElementById('status');
          statusDiv.innerText = 'Download wurde gestartet...';
      
          fetch('http://localhost:5000/download', {
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
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            statusDiv.innerText = 'Download abgeschlossen!';
          })
          .catch(error => {
            console.error('Fetch Error:', error);
            statusDiv.innerText = 'Netzwerkfehler: ' + error;
          });
        });
    });
    ```

5. **Laden Sie die Erweiterung in Chrome:**

    - Öffnen Sie `chrome://extensions/` in Ihrem Chrome-Browser.
    - Aktivieren Sie den "Entwicklermodus" oben rechts.
    - Klicken Sie auf "Entpackte Erweiterung laden" und wählen Sie den Ordner aus, der die oben erstellten Dateien enthält.

6. **Verwenden Sie die Erweiterung:**

    - Öffnen Sie ein YouTube-Video in Chrome.
    - Klicken Sie auf das Symbol der Erweiterung und dann auf "Download as MP3".
