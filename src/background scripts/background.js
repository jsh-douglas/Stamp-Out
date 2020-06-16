// Run on installation.
chrome.runtime.onInstalled.addListener(async () => {
    // Fetch stylesheet.
    const userStyle = await ( await fetch('/src/config/default.json') ).json();

    // Store stylesheet in Chrome synced storage.
    chrome.storage.sync.set({'userStyle': userStyle});
});


// Run when supported site loaded.
chrome.runtime.onMessage.addListener((message, sender) => {
    const url = new URL(sender.tab.url);
    chrome.storage.sync.set({'activeSite': url.hostname});

    // Show extension is available for use
    chrome.pageAction.show(sender.tab.id);
});