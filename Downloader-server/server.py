from flask import Flask, request, send_file, jsonify
import yt_dlp
import io
import os

app = Flask(__name__)

@app.route('/download', methods=['POST'])
def download():
    data = request.get_json()
    url = data.get('url', '')

    if not url:
        return jsonify({'success': False, 'error': 'No URL provided'}), 400

    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': '%(title)s.%(ext)s',
            'quiet': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            title = info_dict.get('title', None)
            filename = ydl.prepare_filename(info_dict)
            mp3_filename = filename.rsplit('.', 1)[0] + '.mp3'

        # Datei im Speicher öffnen
        with open(mp3_filename, 'rb') as f:
            file_data = io.BytesIO(f.read())

        # Datei löschen, nachdem sie in den Speicher geladen wurde
        os.remove(mp3_filename)

        # Datei an den Client senden
        file_data.seek(0)
        response = send_file(file_data, mimetype='audio/mpeg', as_attachment=True, download_name=f"{title}.mp3")
        response.headers['Content-Disposition'] = f'attachment; filename="{title}.mp3"'
        return response
    except Exception as e:
        print(f"Error: {str(e)}")  # Debug-Ausgabe auf dem Server
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('downloads'):
        os.makedirs('downloads')
    app.run(debug=True)
