const root = document.documentElement;

// Wait for popup load
window.addEventListener('load', async () => {
    // Fetch sites.json
    window.sites = await ( await fetch('../sites.json') ).json();

    // Get the current active site
    chrome.storage.sync.get(['activeSite'], result => {
        let siteURL = result.activeSite;

        // Set popup color theme
        // root.style.setProperty('--theme', sites[siteURL].theme);

        // Run appropriate script on click
        document.getElementById('submit').addEventListener('click', () => {
            console.log('clicked');
            chrome.tabs.executeScript({
                file: `/src/scripts/${sites[siteURL].script}`
            });  
        });
    });
});


// function showUser(path) {
//     let userObjIndex = users.findIndex(user => user.path === path); 
//     users[userObjIndex].hidden = false;
//     chrome.runtime.sendMessage({path: path});
// }

function toggleVisibility(userPath, index) {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {userPath: userPath}, response => {
            // Toggle visibility icon using message resposne
            document.getElementById(`visibility-${index}`).className = response.hidden ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    });
}

chrome.runtime.onMessage.addListener(message => {
    const allUserInfo = message.allUserInfo;

    let users = document.getElementById('users');
    Array.from(document.getElementsByClassName('user')).forEach(user => {
        user.remove();
    });
    users.style.display = 'flex';
    console.log(allUserInfo);
    allUserInfo.forEach((userInfo, index) => {
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
            document.getElementById(`color-${index}-label`).style.backgroundColor = document.getElementById(`color-${index}`).value;
        });
        document.getElementById(`manage-${index}`).addEventListener('click', () => {
            toggleVisibility(userInfo.path, index);
        });
    });

});

// chrome.runtime.onMessage.addListener(message => {
//     let user = document.createElement('div');
//     user.className = 'user';
//     user.innerHTML = `
//                     <label class="user__color" for="color-${message.index}" id="color-${message.index}-label" style="background-color:${message.color}">
//                         <input type="color" class="user__color-picker" id="color-${message.index}">
//                         <i class="fas fa-eye-dropper"></i>
//                     </label>
//                     <div class="user__handle">
//                         <p>@${message.username.slice(1)}</p>
//                     </div>
//                     <button class="user__manage" id="manage-${message.index}">
//                         <i class="fas fa-eye-slash"></i>
//                     </button>
//                     `;
//     document.getElementsByClassName('menu__users')[0].appendChild(user);
//     document.getElementsByClassName('menu__users')[0].style.display = 'flex';
//     document.getElementById(`color-${message.index}`).addEventListener('change', () => {
//         document.getElementById(`color-${message.index}-label`).style.backgroundColor = document.getElementById(`color-${message.index}`).value;
//     });
//     document.getElementById(`manage-${message.index}`).addEventListener('click', () => {
//         showUser(message.username);
//     });
// });