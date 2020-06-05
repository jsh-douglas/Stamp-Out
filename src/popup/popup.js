const root = document.documentElement;

let sites;

// Wait for popup load
window.addEventListener('load', async () => {
    // Fetch sites.json
    sites = await ( await fetch('../sites.json') ).json();
    // Get the current active site
    chrome.storage.sync.get(['activeSite'], result => {
        root.style.setProperty('--theme', sites[result.activeSite].theme);
        document.getElementById('submit').addEventListener('click', () => {
            chrome.tabs.executeScript({
                file: `/src/scripts/${sites[result.activeSite].script}`
            });
        });
    });
});

chrome.runtime.onMessage.addListener(message => {
    let user = document.createElement('div');
    user.className = 'user';
    user.innerHTML = `
                    <label class="user__color" for="color-1">
                        <input type="color" class="user__color-picker" id="color-1">
                        <i class="fas fa-eye-dropper"></i>
                    </label>
                    <div class="user__handle">
                        <p>${message.username}</p>
                    </div>
                    <div class="user__manage">
                        <i class="fas fa-times"></i>
                    </div>
                    `;
    document.getElementsByClassName('menu__users')[0].appendChild(user);
    document.getElementsByClassName('menu__users')[0].style.display = 'flex';
});