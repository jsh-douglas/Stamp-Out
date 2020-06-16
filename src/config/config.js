chrome.storage.sync.clear();
chrome.storage.sync.get(null, (result) => {
    console.log(result);
});

const color1 = document.getElementById('color-1');
const color1Label = document.getElementById('color-1-label');
color1.addEventListener('change', () => {
    color1Label.style.backgroundColor = color1.value;
});

const form = document.getElementById('config');

form.addEventListener('submit', () => {
    chrome.storage.sync.set({"color-1": color1.value});
});