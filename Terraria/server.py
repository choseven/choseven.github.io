from http.server import HTTPServer, SimpleHTTPRequestHandler
import mimetypes

# Add support for .dll files
mimetypes.add_type('application/octet-stream', '.dll')
mimetypes.add_type('application/wasm', '.wasm')

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Resource-Policy', 'cross-origin')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache')
        SimpleHTTPRequestHandler.end_headers(self)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    print("Starting server on http://localhost:8080")
    HTTPServer(('', 8080), CORSRequestHandler).serve_forever()