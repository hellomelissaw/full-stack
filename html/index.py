#!/bin/env python3
print("Content-Type: text/html")
print("Cache-Control: no-cache")
print("")

import sqlite3

# Connect to the SQLite database
db_path = "../game.db"  
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Query the database
cursor.execute("SELECT userid FROM user") 
rows = cursor.fetchall()

# Generate HTML content
html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <title>User Data</title>
</head>
<body>
    <h2>User Data</h2>
    <table>
        <tr><th>ID</th><th>Name</th><th>Email</th></tr>
"""

for row in rows:
    html_content += f"<tr><td>user id: {row[0]}</td></tr>\n"

html_content += """</table>
</body>
</html>"""

# Save the HTML file in Apache's web directory
html_file_path = "/var/www/html/index.html"  # Apache serves from here by default
with open(html_file_path, "w") as file:
    file.write(html_content)

print(f"HTML file generated at {html_file_path}")

# Close the database connection
conn.close()
