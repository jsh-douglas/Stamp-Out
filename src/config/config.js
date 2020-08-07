document.getElementById('tabs__colors').addEventListener('submit', async () => {
    let selectedPalette;
    document.getElementsByName('palette-choice').forEach(palette => {
        if (palette.checked) {
            selectedPalette = palette.value;
        }
    });

    const pageStyle = await ( await fetch(`/src/config/pageStyles/${selectedPalette}.json`) ).json();

    chrome.storage.sync.set({'pageStyle': pageStyle});
});