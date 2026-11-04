"""Run the built game locally without installing Node dependencies."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import webbrowser

root = Path(__file__).resolve().parent.parent
os.chdir(root / 'dist' / 'client')
for port in range(4180, 4200):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler)
        break
    except OSError:
        continue
else:
    raise SystemExit('未找到可用端口，请关闭其他本地预览后重试。')
url = f'http://127.0.0.1:{port}/'
print(f'数学漫游已打开：{url}\n关闭这个窗口即可停止。')
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
