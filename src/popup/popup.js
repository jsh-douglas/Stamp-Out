const root = document.documentElement;

// Wait for popup load
window.addEventListener('load', async () => {
    // Fetch sites.json
    window.sites = await ( await fetch('../sites.json') ).json();

    // Get the URL of the current site to run the appropriate script.
    chrome.storage.sync.get(['activeSite'], result => {
        let siteURL = result.activeSite;

        // Run appropriate script on click
        document.getElementById('update').addEventListener('click', () => {
            chrome.tabs.executeScript({
                file: `/src/scripts/${sites[siteURL].script}`
            });  
        });
    });
});

chrome.runtime.onMessage.addListener(message => {
    if (message.query === 'popupInit') {
        const allUserInfo = message.allUserInfo;
        const displayedUsers = message.displayedUsers;
    
        let users = document.getElementById('users');
    
        // Clear users in pop up
        Array.from(document.getElementsByClassName('user')).forEach(user => {
            user.remove();
        });
    
        displayedUsers.forEach((userPath, index) => {
            const userInfo = allUserInfo.find(user => user.path === userPath);
            let user = document.createElement('div');
            user.className = 'user';
            user.innerHTML = `
                            <label class="user__color" for="color-${index}" id="color-${index}-label" style="background-color:${userInfo.color}">
                                <input type="color" class="user__color-picker" id="color-${index}">
                                <i class="fas fa-eye-dropper"></i>
                            </label>
                            <div class="user__handle">
                                <p>@${userInfo.path.slice(1)}</p>
                            </div>
                            <button class="user__manage" id="manage-${index}">
                                <i class="fas fa-eye-slash" id="visibility-${index}"></i>
                            </button>`;
            users.appendChild(user);
            document.getElementById(`color-${index}`).addEventListener('change', () => {
                const color = document.getElementById(`color-${index}`).value;
                document.getElementById(`color-${index}-label`).style.backgroundColor = color;
                setColor(userInfo.path, color);
            });
            document.getElementById(`manage-${index}`).addEventListener('click', () => {
                toggleVisibility(userInfo.path, index);
            });
        });
    }
});


function toggleVisibility(userPath, index) {
    // Send message to content script to remove styling from provided user.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {query: 'toggleVisibility', userPath: userPath}, response => {
            // On response, toggle visibility icon.
            document.getElementById(`visibility-${index}`).className = response.hidden ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    });
}

function setColor(userPath, color) {
    // Send message to content script to change the color of the provided user.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {query: 'setColor', userPath: userPath, color: color});
    });
}
