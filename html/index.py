def application(enverion, start_response):
  status = '200 OK'
  output = b"""<h1><center>It Works</center></h1>
             <h2><center>Best game ever, right here</center></h2>"""

  response_headers = [('Content-Type', 'text/html'),
                      ('Content-Length', str(len(output))),
                      ('Cache-Control', 'no-cache')]

  start_response(status, response_headers)
  return [output]
