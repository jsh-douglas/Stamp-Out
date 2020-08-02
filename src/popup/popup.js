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

        // Username slicing for pop up interface
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
        port.postMessage({ query: 'main' });
    });

    // Redirect to config page
    document.getElementById('config-button').addEventListener('click', () => {
        chrome.tabs.create({ url: 'src/config/config.html' });
    });

    document.getElementById('precise-time').addEventListener('click', () => {
        port.postMessage({ query: 'preciseTime', format: document.getElementById('precise-time').checked ? 'precise' : 'timeSince' });
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
                                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye-dropper" class="svg-inline--fa fa-eye-dropper fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path d="M50.75 333.25c-12 12-18.75 28.28-18.75 45.26V424L0 480l32 32 56-32h45.49c16.97 0 33.25-6.74 45.25-18.74l126.64-126.62-128-128L50.75 333.25zM483.88 28.12c-37.47-37.5-98.28-37.5-135.75 0l-77.09 77.09-13.1-13.1c-9.44-9.44-24.65-9.31-33.94 0l-40.97 40.97c-9.37 9.37-9.37 24.57 0 33.94l161.94 161.94c9.44 9.44 24.65 9.31 33.94 0L419.88 288c9.37-9.37 9.37-24.57 0-33.94l-13.1-13.1 77.09-77.09c37.51-37.48 37.51-98.26.01-135.75z">
                                    </path>
                                </svg>
                            </label>
                        </div>
                        <div class="popup__username">
                            ${usernamePrefix}${userData.path.slice(usernameSliceStart, usernameSliceEnd)}
                        </div>
                        <div class="popup__button-container">
                            <input type="checkbox" id="toggle-${index}" class="popup__toggle-input" checked>
                            <label for="toggle-${index}" class="popup__toggle-label" id="toggle-${index}-label">
                                <div class="toggle-switch">
                                    <svg class="toggle-hidden" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye-slash" class="svg-inline--fa fa-eye-slash fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                                        <path fill="#FF5A69" d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z">
                                        </path>
                                    </svg>
                                    <svg class="toggle-visible" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye" class="svg-inline--fa fa-eye fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                        <path fill="#c5c8cb" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z">
                                        </path>
                                    </svg>
                                    
                                </div>
                            </label>
                        </div>
                        `;

        userManagement.appendChild(user);

        const userColor = document.getElementById(`user-color-${index}`);
        userColor.addEventListener('input', () => {
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
