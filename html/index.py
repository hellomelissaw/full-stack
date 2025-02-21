import sqlite3

def application(enverion, start_response):
    status = '200 OK'
    output = b"""<h1><center>It Works</center></h1>
            <h2><center>Best game ever, right here</center></h2>"""

    response_headers = [('Content-Type', 'text/html'),
                    ('Content-Length', str(len(output))),
                    ('Cache-Control', 'no-cache')]
    
    start_response(status, response_headers)

    # Connect to the SQLite database
    db_path = "../game.db"  
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Query the database
    cursor.execute("SELECT * FROM user") 
    rows = cursor.fetchall()

    # Output some headers
    print("Content-Type: text/html\n")
    print("")

    # Generate HTML content
    html_content = """<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Data</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border: 1px solid black; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h2>User Data</h2>
        <table>
            <tr><th>ID</th><th>Name</th><th>Email</th></tr>
    """

    for row in rows:
        html_content += f"<tr><td>user id: {row[0]}</td><td>user name: {row[1]}</td></tr>\n"

    html_content += """</table>
    </body>
    </html>"""

    # Save the HTML file in Apache's web directory
    # html_file_path = "index.html"  # Apache serves from here by default
    # with open(html_file_path, "w") as file:
    #     file.write(html_content)
    
    

    # Close the database connection
    conn.close()
    print("Database connection closed.")

    print(f"Heeej bish, serving HTML.")
    return [html_content]
