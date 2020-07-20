// - - - - - - - - - - - - - - - - - - -
//  Port Messaging
// - - - - - - - - - - - - - - - - - - -






// - - - - - - - - - - - - - - - - - - - 
//  Pop-up Initialisation
// - - - - - - - - - - - - - - - - - - -

window.addEventListener('load', async () => {
    // Fetch sites.json
    window.sites = await (await fetch('../sites.json')).json();

    

    // Get the URL of the current site to run the appropriate script.
    chrome.storage.sync.get(['activeSite'], result => {
        window.siteURL = result.activeSite;

        window.usernameSliceStart = sites[siteURL].usernameSliceStart;
        window.usernameSliceEnd = sites[siteURL].usernameSliceEnd;
        window.usernamePrefix = sites[siteURL].usernamePrefix;
        
        chrome.tabs.executeScript({ file: `/src/scripts/${sites[siteURL].script}` });

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            window.port = chrome.tabs.connect(tabs[0].id, { name: "scriptConnection" });
        
            port.postMessage({ query: "initialise" });
            
            port.onMessage.addListener(message => {
                switch (message.query) {
                    case 'mainComplete':
                        window.displayedUsers = message.displayedUsers;
                        window.displayedUserData = message.displayedUserData;
                        main();
                }
            });
        });
    });

    // Run appropriate script on click
    document.getElementById('refresh-button').addEventListener('click', () => {
        port.postMessage({query: 'main'});
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
        const userData = displayedUserData.find(user => user.path === userPath);

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
                            ${usernamePrefix}${userData.path.slice(usernameSliceStart, usernameSliceEnd)}
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

        const userColor = document.getElementById(`user-color-${index}`);
        userColor.addEventListener('change', () => {
            const color = userColor.value;
            document.getElementById(`user-color-${index}-label`).style.backgroundColor = color;
            port.postMessage({ query: 'setColor', userPath: userPath, color: color });
        });

        const toggleSwitch = document.getElementById(`toggle-${index}`);
        toggleSwitch.addEventListener('click', () => {
            port.postMessage({ query: 'toggleVisibility', userPath: userPath, hidden: toggleSwitch.checked });
        });
    });
}
