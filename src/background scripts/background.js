// Run on installation.
chrome.runtime.onInstalled.addListener(async () => {
    // Fetch default page styling.
    const pageStyle = await ( await fetch('/src/config/default.json') ).json();

    // Store stylesheet in Chrome synced storage.
    chrome.storage.sync.set({'pageStyle': pageStyle});
});

// Run when supported site loaded.
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.query === 'supportedSiteLoaded') {
        // Store supported site URL in Chrome synced storage for use later in pop up script.
        const supportedPageURL = new URL(sender.tab.url);
        chrome.storage.sync.set({'activeSite': supportedPageURL.hostname});

        // Show extension is available for use.
        chrome.pageAction.show(sender.tab.id);
    }
});