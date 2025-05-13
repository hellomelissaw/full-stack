function login() {                                      /*the function login fromt loginPage.html*/
    const username = document.getElementById("username").value; /*takes the entered input*/ 
    //chechs if inputbox is empty
    if (!username) {
        alert("Please enter a username");
        return;
    }
    //sends request to backend. tells the server the request contains JSON data.
    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }) // Send the username to the backend
    })
    .then(response => response.json()) //watis for a respronse from backend and converts it into javascript object.
    .then(data => {
        alert(data.message); // Show success message if login succesful
    })
    .catch(error => console.error("Error:", error));
}
