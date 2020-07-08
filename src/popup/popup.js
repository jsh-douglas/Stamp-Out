// - - - - - - - - - - - - - - - - - - -
//  Port Messaging
// - - - - - - - - - - - - - - - - - - -

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'popupConnection') {
        window.port = port;
        port.onMessage.addListener(message => {
            switch (message.query) {
                case 'scriptLoaded':
                    port.postMessage({query: 'init'});
                    break;

                case 'initResponse':
                    port.postMessage({query: 'main'});
                    break;

                case 'getDisplayedUsersResponse':               
                    window.displayedUsers = message.displayedUsers;
                    break;

                case 'getAllUsersResponse':
                    window.allUsers = message.allUsers;
                    break;

                case 'getAllUserDataResponse':
                    window.allUserData = message.allUserData;
                    break;

                case 'mainComplete':
                    window.displayedUsers = message.displayedUsers;
                    window.allUserData = message.allUserData;
                    main();
            }
        });
    }
});

// - - - - - - - - - - - - - - - - - - -
//  Pop-up Initialisation
// - - - - - - - - - - - - - - - - - - -

window.addEventListener('load', async () => {
    // Fetch sites.json
    window.sites = await (await fetch('../sites.json')).json();

    // Get the URL of the current site to run the appropriate script.
    chrome.storage.sync.get(['activeSite'], result => {
        window.siteURL = result.activeSite;
    });

    // Run appropriate script on click
    document.getElementById('refresh-button').addEventListener('click', () => {
        chrome.tabs.executeScript({ file: `/src/scripts/${sites[siteURL].script}` });
    });

    // Redirect to config page
    document.getElementById('config-button').addEventListener('click', () => {
        chrome.tabs.create({ url: 'src/config/config.html' });
    });

    document.getElementById('precise-time').addEventListener('click', () => {
        port.postMessage({query: 'preciseTime', format: document.getElementById('precise-time').checked ? 'precise' : 'timeSince'});
    });
});

// - - - - - - - - - - - - - - - - - - -
//  Main
// - - - - - - - - - - - - - - - - - - -

function main() {
    const userManagement = document.getElementById('user-management');

    // Clear users in user management
    while (userManagement.firstChild) {
        userManagement.removeChild(userManagement.lastChild);
    }

    displayedUsers.forEach((userPath, index) => {
        const userData = allUserData.find(user => user.path === userPath);

        // Create element
        let user = document.createElement('div');
        user.className = 'popup__user';

        user.innerHTML = `
                        <div class="popup__user-color-container">
                            <label for="user-color-${index}" style="background-color:${userData.color}" id="user-color-${index}-label" class="popup__user-color-label">
                                <input type="color" class="popup__user-color-input" id="user-color-${index}">
                                <i class="fas fa-eye-dropper"></i>
                            </label>
                        </div>
                        <div class="popup__username">
                            @${userData.path.slice(1)}
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

        userManagement.appendChild(user);

        document.getElementById(`user-color-${index}`).addEventListener('change', () => {
            const color = document.getElementById(`user-color-${index}`).value;
            document.getElementById(`user-color-${index}-label`).style.backgroundColor = color;
            port.postMessage({ query: 'setColor', userPath: userPath, color: color });
            
        });

        document.getElementById(`toggle-${index}-label`).addEventListener('click', () => {
            port.postMessage({ query: 'toggleVisibility', userPath: userPath });
        });
    });
}
