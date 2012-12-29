#!/usr/bin/env python
#
# Usage:
#    cd <web root dir>
#    localWebServer [port]
#
# From: http://www.linuxjournal.com/content/tech-tip-really-simple-http-server-python
#
# Alternate that serves on all interfaces is a one liner:
#
#   python -m SimpleHTTPServer
#
import sys
import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler


HandlerClass = SimpleHTTPRequestHandler
ServerClass  = BaseHTTPServer.HTTPServer
Protocol     = "HTTP/1.0"

if sys.argv[1:]:
    port = int(sys.argv[1])
else:
    port = 8000
server_address = ('127.0.0.1', port)

HandlerClass.protocol_version = Protocol
httpd = ServerClass(server_address, HandlerClass)

sa = httpd.socket.getsockname()
print "Serving HTTP on", sa[0], "port", sa[1], "..."
httpd.serve_forever()

