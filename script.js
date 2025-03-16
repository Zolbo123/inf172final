function checkLogin() {
    if (window.location.pathname.includes("login.html")) return; 
    let user = localStorage.getItem("currentUser");
    if (!user) {
        window.location.href = "login.html";
    } else {
        document.getElementById("userDisplay").innerText = `Logged in as: ${user}`;
    }
}

function login() {
    let username = document.getElementById("username").value.trim();
    if (username) {
        localStorage.setItem("currentUser", username);
        window.location.href = "about.html";
    } else {
        alert("Please enter a username.");
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function startJournaling() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.toLocaleString('default', { month: 'long' });
    let day = today.getDate();

    window.location.href = `past_entries.html#entry-${year}-${month}-${day}`;
}

function showMonths(year) {
    let monthsContainer = document.getElementById("months-container");
    let monthsDiv = document.getElementById("months");
    let daysContainer = document.getElementById("days-container");
    let entriesContainer = document.getElementById("entries-container");

    daysContainer.classList.add("hidden");
    entriesContainer.classList.add("hidden");
    monthsContainer.classList.remove("hidden");
    monthsDiv.innerHTML = ""; 

    let months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    months.forEach(month => {
        let monthDiv = document.createElement("div");
        monthDiv.classList.add("selectable");
        monthDiv.innerText = month;
        monthDiv.onclick = () => showDays(year, month);
        monthsDiv.appendChild(monthDiv);
    });
}

function showDays(year, month) {
    let daysContainer = document.getElementById("days-container");
    let daysDiv = document.getElementById("days");
    let entriesContainer = document.getElementById("entries-container");

    entriesContainer.classList.add("hidden");
    daysContainer.classList.remove("hidden");
    daysDiv.innerHTML = ""; 

    let daysInMonth = new Date(year, new Date(Date.parse(month + " 1, " + year)).getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        let dayDiv = document.createElement("div");
        dayDiv.classList.add("selectable");
        dayDiv.innerText = day;
        dayDiv.onclick = () => showEntries(`${year}-${month}-${day}`, year, month);
        daysDiv.appendChild(dayDiv);
    }
}

function showEntries(dateKey, year, month) {
    let entryContainer = document.getElementById("entries-container");
    let entryList = document.getElementById("entryList");
    let entryForm = document.getElementById("entryForm");

    entryContainer.classList.remove("hidden");
    entryForm.classList.remove("hidden"); 
    entryForm.setAttribute("data-date", dateKey);
    entryList.innerHTML = ""; 

    let user = localStorage.getItem("currentUser");
    let allEntries = JSON.parse(localStorage.getItem("journalEntries")) || {};

    if (!allEntries[user]) allEntries[user] = {}; 
    if (!allEntries[user][dateKey]) allEntries[user][dateKey] = []; 

    if (allEntries[user][dateKey].length === 0) {
        entryList.innerHTML = "<p>No journal entries for this date.</p>";
    } else {
        allEntries[user][dateKey].forEach((entry, index) => {
            let entryDiv = document.createElement("div");
            entryDiv.classList.add("entry");
            entryDiv.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content}</p>
                <strong>Song: ${entry.song || "No song matched yet"}</strong>
                <button onclick="deleteEntry('${dateKey}', ${index}, '${year}', '${month}')">Delete</button>
            `;
            entryList.appendChild(entryDiv);
        });
    }
}


function deleteEntry(dateKey, index, year, month) {
    let user = localStorage.getItem("currentUser");
    let allEntries = JSON.parse(localStorage.getItem("journalEntries")) || {};

    if (allEntries[user] && allEntries[user][dateKey]) {
        allEntries[user][dateKey].splice(index, 1);
        if (allEntries[user][dateKey].length === 0) {
            delete allEntries[user][dateKey];
        }
        localStorage.setItem("journalEntries", JSON.stringify(allEntries));
        showEntries(dateKey, year, month);
    }
}

function addEntry() {
    let title = document.getElementById("title").value.trim();
    let content = document.getElementById("content").value.trim();
    let song = document.getElementById("song").value.trim();
    let dateKey = document.getElementById("entryForm").getAttribute("data-date");
    let user = localStorage.getItem("currentUser");

    if (!title || !content) {
        alert("Title and content cannot be empty!");
        return;
    }

    let allEntries = JSON.parse(localStorage.getItem("journalEntries")) || {};
    if (!allEntries[user]) {
        allEntries[user] = {};
    }
    if (!allEntries[user][dateKey]) {
        allEntries[user][dateKey] = [];
    }

    let newEntry = { title, content, song };
    allEntries[user][dateKey].push(newEntry);

    localStorage.setItem("journalEntries", JSON.stringify(allEntries));

    showEntries(dateKey);
    resetForm();
}


function resetForm() {
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
    document.getElementById("song").value = "";
}

function updateMatchSongs() {
    let matchPage = window.opener || window.parent;
    if (matchPage && matchPage.loadMatchSongs) {
        matchPage.loadMatchSongs();
    }
}

function loadMatchSongs() {
    let user = localStorage.getItem("currentUser");
    let entries = JSON.parse(localStorage.getItem("journalEntries")) || {};
    let userEntries = entries[user] || {};

    let entryContainer = document.getElementById("entries-list");
    let songContainer = document.getElementById("songs-list");
    let gameButton = document.getElementById("gameButton");

    entryContainer.innerHTML = "";
    songContainer.innerHTML = "";

    let allEntries = [];
    let allSongs = new Set();

    Object.keys(userEntries).forEach(date => {
        userEntries[date].forEach(entry => {
            allEntries.push({ date, title: entry.title, content: entry.content, correctSong: entry.song });
            if (entry.song) {
                allSongs.add(entry.song);
            }
        });
    });

    if (allEntries.length === 0 || allSongs.size === 0) {
        entryContainer.innerHTML = "<p>No journal entries with songs yet. Start journaling!</p>";
        return;
    }

    let songArray = Array.from(allSongs);
    songArray.sort(() => Math.random() - 0.5);

    allEntries.forEach(entry => {
        let div = document.createElement("div");
        div.classList.add("entry");
        div.innerHTML = `<h3>${entry.title}</h3><p>${entry.content}</p>
                         <div class="drop-zone" data-date="${entry.date}" data-title="${entry.title}" data-correct-song="${entry.correctSong}">
                             Drop Song Here
                         </div>`;
        entryContainer.appendChild(div);
    });

    songArray.forEach(song => {
        let songDiv = document.createElement("div");
        songDiv.classList.add("song");
        songDiv.innerText = song;
        songDiv.setAttribute("draggable", "true");
        songDiv.setAttribute("data-song", song);

        songDiv.addEventListener("dragstart", dragStart);
        songContainer.appendChild(songDiv);
    });

    document.querySelectorAll(".drop-zone").forEach(zone => {
        zone.addEventListener("dragover", dragOver);
        zone.addEventListener("drop", dropSong);
    });

    gameButton.innerText = "Restart Game";
}

function dragStart(event) {
    event.dataTransfer.setData("text", event.target.getAttribute("data-song"));
}

function dragOver(event) {
    event.preventDefault();
}

function dropSong(event) {
    event.preventDefault();
    let droppedSong = event.dataTransfer.getData("text");
    let dropZone = event.target;
    let correctSong = dropZone.getAttribute("data-correct-song");

    if (droppedSong === correctSong) {
        dropZone.innerText = `Matched: ${droppedSong}`;
        dropZone.classList.remove("wrong-match");
        dropZone.classList.add("matched");
    } else {
        dropZone.innerText = `Wrong Match: ${droppedSong}`;
        dropZone.classList.remove("matched");
        dropZone.classList.add("wrong-match");
    }
}

function resetGame() {
    loadMatchSongs();
}
window.onload = function () {
    checkLogin();
    let gameButton = document.getElementById("gameButton");
    if (gameButton) gameButton.innerText = "Start Game"; 
};