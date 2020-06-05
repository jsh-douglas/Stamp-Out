// let sites;
// chrome.runtime.onInstalled.addListener(async () => {
//     sites = await ( await fetch('./src/sites.json') ).json();
//     // STORE IN SYNC VARIABLE
// })

chrome.runtime.onInstalled.addListener(async () => {
    const defaultStyling = await ( await fetch('/src/config/default.json') ).json();
    chrome.storage.sync.set({'styling': defaultStyling}, () => {
        console.log('Styling Saved');
    });
    
});


// Run when supported site loaded.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const url = new URL(sender.tab.url);
    chrome.storage.sync.set({'activeSite': url.hostname});
    chrome.pageAction.show(sender.tab.id);
});