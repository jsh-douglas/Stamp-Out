const root = document.documentElement;

let sites;

// Wait for popup load
window.addEventListener('load', async () => {
    // Fetch sites.json
    sites = await ( await fetch('../sites.json') ).json();

    // Get the current active site
    chrome.storage.sync.get(['activeSite'], result => {
        let siteURL = result.activeSite;

        // Set popup color theme
        root.style.setProperty('--theme', sites[siteURL].theme);

        // Run appropriate script on click
        document.getElementById('submit').addEventListener('click', () => {
            chrome.tabs.executeScript({
                file: `/src/scripts/${sites[siteURL].script}`
            });  
        });
    });
});

let users = [];

function showUser(path) {
    let userObjIndex = users.findIndex(user => user.path === path); 
    users[userObjIndex].hidden = false;
    chrome.runtime.sendMessage({path: path});
}

chrome.runtime.onMessage.addListener(message => {
    users.push({"path": message.username, "hidden": true, "color": message.color});
    let user = document.createElement('div');
    user.className = 'user';
    user.innerHTML = `
                    <label class="user__color" for="color-${message.index}" id="color-${message.index}-label" style="background-color:${message.color}">
                        <input type="color" class="user__color-picker" id="color-${message.index}">
                        <i class="fas fa-eye-dropper"></i>
                    </label>
                    <div class="user__handle">
                        <p>@${message.username.slice(1)}</p>
                    </div>
                    <button class="user__manage" id="manage-${message.index}">
                        <i class="fas fa-times"></i>
                    </button>
                    `;
    document.getElementsByClassName('menu__users')[0].appendChild(user);
    document.getElementsByClassName('menu__users')[0].style.display = 'flex';
    document.getElementById(`color-${message.index}`).addEventListener('change', () => {
        document.getElementById(`color-${message.index}-label`).style.backgroundColor = document.getElementById(`color-${message.index}`).value;
    });
    document.getElementById(`manage-${message.index}`).addEventListener('click', () => {
        showUser(message.username);
    });
});