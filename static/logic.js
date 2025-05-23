
document.getElementById("quit-btn")?.addEventListener("click", function (event) {
    event.preventDefault();
    let confirmExit = confirm("Are you sure you want to quit?");
    if (confirmExit) {
        window.location.href = "/quit"; 
    }
})

document.getElementById("save-button")?.addEventListener("click", function () {
    
    let popup = document.createElement("div");
    popup.textContent = "Game saved";
    
    /* Style for the samved game pop-up*/
    popup.style.position = "fixed";
    popup.style.top = "20px";
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.backgroundColor = "#4CAF50";  
    popup.style.color = "white";
    popup.style.padding = "10px 20px";
    popup.style.borderRadius = "5px";
    popup.style.fontSize = "16px";
    popup.style.textAlign = "center";
    popup.style.zIndex = "9999";
    popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    
    document.body.appendChild(popup); /* the child is the pop up box*/
    
    /* Set a timer to remove the popup after 1 second */
    setTimeout(function () {
        popup.remove();
    }, 1000);  
});


document.getElementById("new-game")?.addEventListener("click", function (event) {
    event.preventDefault(); // Prevents default <a> behavior
    window.location.href = "gamepage.html"; /* Redirect to game page*/
});

// Event listener for the Inventory button
document.getElementById("inventory-button")?.addEventListener("click", function () {
    let inventoryContainer = document.getElementById("inventory-container");

    if (inventoryContainer.style.height === "0px" || inventoryContainer.style.height === "") {
        inventoryContainer.style.display = "block";
        setTimeout(() => {
            inventoryContainer.style.height = "150px";
        }, 10);
        this.textContent = "Close Inventory";
    } else {
        inventoryContainer.style.height = "0px";
        setTimeout(() => {
            inventoryContainer.style.display = "none";
        }, 500);
        this.textContent = "Inventory";
    }
});

// Event listener for the Exit Game button
document.getElementById("exit-button")?.addEventListener("click", function () {
    window.location.href = "/"; 
});

function handleAction(act_id) {
    fetch(`/update_game_page_data?act_id=${act_id}`)
    .then(async res => {
        console.log("Response status:", res.status);
        console.log("Response headers:", [...res.headers]);

        const text = await res.text();
        console.log("Raw response text:", text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (err) {
            console.error("Failed to parse JSON:", err);
            throw new Error("Invalid JSON response from server");
        }
    })
    .then(data => {
        const button = document.getElementById(`action-${act_id}`);
        button.disabled = true;
        button.onclick = null;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
        button.style.pointerEvents = "none";
         
        document.getElementById('description-text').innerHTML = data.description;
        document.getElementById('stats').innerHTML = data.stats;
    })
    .catch(err => {
        console.error("Error in handleAction:", err);
        document.getElementById('description-text').innerHTML = "An error occurred.";
    });
}
