#!/bin/env python3
print("Content-Type: text/html")
print("Cache-Control: no-cache")
print("")

html_content = """<!DOCTYPE html>
<html>
<head>
    <title>User Data</title>
</head>
<body>
    <h2>User Data</h2>
    <table>
        <tr><th>ID</th><th>Name</th><th>Email</th></tr>
</table>
</body>
</html>"""


print(html_content)

