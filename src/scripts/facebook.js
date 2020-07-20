// - - - - - - - - - - - - - - - - - - -
//  Message Listeners
// - - - - - - - - - - - - - - - - - - -

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'scriptConnection') {
        port.onMessage.addListener(message => {
            switch (message.query) {
                case 'initialise':
                    initialise();
                    break;
                case 'main':
                    main();
                    port.postMessage({query: 'mainComplete', displayedUsers: Array.from(displayedUsers), displayedUserData: displayedUserData});
                    break;
                case 'toggleVisibility':
                    userIndex = displayedUserData.findIndex(user => user.path === message.userPath); 
                    displayedUserData[userIndex].hidden = message.hidden;
                    displayedUserData[userIndex].hidden ? hideUser(message.userPath, pageStyle.default) : showUser(message.userPath);
                    break;
                case 'setColor':
                    userIndex = displayedUserData.findIndex(user => user.path === message.userPath); 
                    displayedUserData[userIndex].color = message.color;
                    hideUser(message.userPath);
                    break;
    
                case 'preciseTime':
                    convertDates(message.format);
                    break;
            }
        });
    }
});

// - - - - - - - - - - - - - - - - - - -
//  Initialisation
// - - - - - - - - - - - - - - - - - - -

function initialise() {
    if (typeof initComplete == 'undefined') {
        // Prevent code repeating
        window.initComplete = true;

        // Element attributes used for selecting hyperlinks
        window.userLink = [
            'span.fwb.fcg > a'
        ];
        window.profilePictureClass = '_5pb8 q_1c0a0h-xei _8o _8s lfloat _ohe';

        window.displayedUsers = new Set();
        window.displayedUserData = [];

        // Get styling
        chrome.storage.sync.get(['pageStyle'], result => {
            window.pageStyle = result.pageStyle;
        });
    }
}

// - - - - - - - - - - - - - - - - - - -
//  Main script for hiding users.
// - - - - - - - - - - - - - - - - - - -

function main() {
    // Remove styling from all previously hidden users
    Array.from(displayedUsers).forEach(userPath => {
        showUser(userPath);
    });

    // Remove any previous users
    displayedUsers.clear();
    displayedUserData.length = 0;

    // Get all users present on page.
    document.querySelectorAll(userLink).forEach(hyperlink => {
        // Use hyperlink to get user's account name
        let userPath = (new URL(hyperlink.href)).pathname;
        console.log(userPath);
        displayedUsers.add(userPath);
    });

    // Convert users set to array to allow for indexing with the forEach() function.
    Array.from(displayedUsers).forEach((userPath, index) => {

        let indexStyling = pageStyle[index.toString()];
        
        let assignedColor;
        if (typeof indexStyling === 'undefined') {
            assignedColor = pageStyle.default.backgroundColor;
        } else {
            assignedColor = indexStyling.backgroundColor;
        }
        
        displayedUserData.push({ 'path': userPath, 'color': assignedColor, "hidden": true });

        hideUser(userPath);
    });
}

// - - - - - - - - - - - - - - - - - - -
//  showUser() - Removes styling 
// - - - - - - - - - - - - - - - - - - -

function showUser(userPath) {
    document.querySelectorAll(`a[href*='${userPath}']`).forEach(element => {
        // Show child elements.
        for (let i = 0; i < element.children.length; i++) {
            element.children[i].style.setProperty('opacity', 1);
        }

        // Remove Styling.
        element.style.removeProperty('background-color');
        element.style.removeProperty('border-radius');
        element.style.removeProperty('box-shadow');
        element.style.removeProperty('color');
    });
}

// - - - - - - - - - - - - - - - - - - -
//  hideUser() - Applies custom styling
// - - - - - - - - - - - - - - - - - - -

function hideUser(userPath) {
    const userData = displayedUserData.find(user => user.path === userPath);
    document.querySelectorAll(`a[href*='${userPath}']`).forEach(element => {
        // Hide child elements.
        for (let i = 0; i < element.children.length; i++) {
            element.children[i].style.setProperty('transition', pageStyle.all.transition);
            element.children[i].style.setProperty('opacity', 0);
        }

        // Apply Styling.
        element.style.setProperty('background-color', userData.color);
        element.style.setProperty('box-shadow', pageStyle.all.boxShadow);
        element.style.setProperty('color', pageStyle.all.color);
        element.style.setProperty('transition', pageStyle.all.transition);

        // Profile pictures are circular and so have a border radius reflecting that.
        if (element.className === profilePictureClass) {
            element.style.setProperty('border-radius', '100%');
        } else {
            element.style.setProperty('border-radius', pageStyle.all.borderRadius);
        }
    });
}

// - - - - - - - - - - - - - - - - - - -
//  convertDates() - Switches between time formats
// - - - - - - - - - - - - - - - - - - -

function convertDates(format) {
    const times = document.getElementsByTagName('time');
    for (let i = 0; i < times.length; i++) {
        if (format === 'precise') {
            times[i].setAttribute('timeSince', times[i].innerHTML);
            times[i].innerHTML = (new Date(times[i].getAttribute('datetime'))).toLocaleString().slice(0, -3);
        } else {
            times[i].innerHTML = times[i].getAttribute('timeSince');
        }

    }
}