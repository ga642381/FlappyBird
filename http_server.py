#/usr/bin/python
import sys
import http.server
from http.server import HTTPServer
from http.server import SimpleHTTPRequestHandler

HandlerClass = SimpleHTTPRequestHandler
ServerClass  = HTTPServer
Protocol     = "HTTP/1.0"

if sys.argv[1:]:
  port = int(sys.argv[1])
else:
  port = 9000
address = 'localhost'
server_address = (address, port)

HandlerClass.protocol_version = Protocol
httpd = ServerClass(server_address, HandlerClass)

sa = httpd.socket.getsockname()
print ("Serving HTTP on", sa[0], "port", sa[1], "...")
url =  "http://{}:{}".format(address, port)
print("please go to : ")
print('    +' + '-'*len(url) + '+')
print('    |' + url + '|')
print('    +' + '-'*len(url) + '+')
httpd.serve_forever()
