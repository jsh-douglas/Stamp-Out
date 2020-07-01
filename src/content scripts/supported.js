// Automatically runs when a supported site is loaded, message is received by background script.
chrome.runtime.sendMessage({query: 'supportedSiteLoaded'});