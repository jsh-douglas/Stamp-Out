const root = document.documentElement;

document.getElementById('config-button').addEventListener('click', () => {
    chrome.tabs.create({ url: 'src/config/config.html' });
});

// Wait for popup load
window.addEventListener('load', async () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {query: 'alreadyRun'});
    });


    // Fetch sites.json
    window.sites = await ( await fetch('../sites.json') ).json();

    // Get the URL of the current site to run the appropriate script.
    chrome.storage.sync.get(['activeSite'], result => {
        let siteURL = result.activeSite;

        // Run appropriate script on click
        document.getElementById('refresh-button').addEventListener('click', () => {
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
        Array.from(document.getElementsByClassName('popup__user')).forEach(user => {
            user.remove();
        });
    
        displayedUsers.forEach((userPath, index) => {
            const userInfo = allUserInfo.find(user => user.path === userPath);
            let user = document.createElement('div');
            user.className = 'popup__user';
            
            user.innerHTML = `
                            <div class="popup__user-color-container">
                                <label for="user-color-${index}" style="background-color:${userInfo.color}" id="user-color-${index}-label" class="popup__user-color-label">
                                    <input type="color" class="popup__user-color-input" id="user-color-${index}">
                                    <i class="fas fa-eye-dropper"></i>
                                </label>
                            </div>
                            <div class="popup__username">
                                @${userInfo.path.slice(1)}
                            </div>
                            <div class="popup__button-container">
                                <input type="checkbox" id="toggle-${index}" class="popup__toggle-input" checked>
                                <label for="toggle-${index}" class="popup__toggle-label" id="toggle-${index}-label">
                                    <div class="toggle-switch">
                                        <i class="fas fa-eye toggle-visible"></i>
                                        <i class="fas fa-eye-slash toggle-hidden"></i>
                                    </div>
                                </label>
                            </div>
                            `;
            users.appendChild(user);
            document.getElementById(`user-color-${index}`).addEventListener('change', () => {
                const color = document.getElementById(`user-color-${index}`).value;
                document.getElementById(`user-color-${index}-label`).style.backgroundColor = color;
                setColor(userInfo.path, color);
            });
            document.getElementById(`toggle-${index}-label`).addEventListener('click', () => {
                toggleVisibility(userInfo.path, index);
            });
        });
    }
});


function toggleVisibility(userPath, index) {
    // Send message to content script to remove styling from provided user.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {query: 'toggleVisibility', userPath: userPath});
    });
}

function setColor(userPath, color) {
    // Send message to content script to change the color of the provided user.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {query: 'setColor', userPath: userPath, color: color});
    });
}
