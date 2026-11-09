from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


BASE_DIR = Path(__file__).resolve().parent
DRAWING_FILE = BASE_DIR / "saved_drawing.png"
MAX_DRAWING_SIZE = 20 * 1024 * 1024
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


class WhiteboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        if urlsplit(self.path).path != "/api/drawing":
            super().do_GET()
            return

        if not DRAWING_FILE.is_file():
            self.send_error(404, "No saved drawing found")
            return

        try:
            drawing = DRAWING_FILE.read_bytes()
        except OSError:
            self.log_error("Could not read saved drawing")
            self.send_error(500, "Could not load drawing")
            return

        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Content-Length", str(len(drawing)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(drawing)

    def do_POST(self):
        if urlsplit(self.path).path != "/api/drawing":
            self.send_error(404)
            return

        try:
            content_length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            self.send_error(400, "A valid Content-Length is required")
            return

        if content_length <= 0 or content_length > MAX_DRAWING_SIZE:
            self.send_error(413, "Drawing must be between 1 byte and 20 MB")
            return

        drawing = self.rfile.read(content_length)
        if len(drawing) != content_length or not drawing.startswith(PNG_SIGNATURE):
            self.send_error(400, "Request body must be a PNG image")
            return

        try:
            DRAWING_FILE.write_bytes(drawing)
        except OSError:
            self.log_error("Could not write saved drawing")
            self.send_error(500, "Could not save drawing")
            return

        self.send_response(204)
        self.send_header("Content-Length", "0")
        self.end_headers()


if __name__ == "__main__":
    address = ("127.0.0.1", 8000)
    with ThreadingHTTPServer(address, WhiteboardHandler) as server:
        print(f"Whiteboard running at http://{address[0]}:{address[1]}")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nWhiteboard server stopped")