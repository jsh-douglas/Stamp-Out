// Code only to be run once per instance of Twitter
if (typeof(initComplete) === 'undefined') {
    console.log('first ');
    // Prevent code repeating
    window.initComplete = true;

    // Element attributes used for selecting hyperlinks
    window.userLink = 'a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l';
    window.profilePictureClass = 'css-4rbku5 css-18t94o4 css-1dbjc4n r-sdzlij r-1loqt21 r-1adg3ll r-ahm1il r-1ny4l3l r-1udh08x r-o7ynqc r-6416eg r-13qz1uu';

    // Declare users set
    window.allUsers = new Set();
    window.displayedUsers = new Set();
    window.allUserInfo = [];

    // Get styling
    chrome.storage.sync.get(['userStyle'], result => {
        window.pageStyle = result.userStyle;
        main();
    });
} else {
    main();
}


function main() {
    displayedUsers.clear();

    // Get all users present on page.
    document.querySelectorAll(userLink).forEach(hyperlink => {
        let userPath = ( new URL(hyperlink.href) ).pathname;
        allUsers.add(userPath);
        displayedUsers.add(userPath);
    });

    console.log(allUsers);
    
    // chrome.runtime.sendMessage({allUsers: Array.from(allUsers), displayedUsers: Array.from(displayedUsers)});
    
    // Convert users set to array to allow for indexing with the forEach() function.
    Array.from(displayedUsers).forEach((userPath, index) => {

        let userStyle;
        // Unique styling is available for a limited number of users, revert to default if number of users exceeds this limit.
        if (typeof(pageStyle[index.toString()]) === 'undefined') {
            userStyle = pageStyle.default;
        } else {
            userStyle = pageStyle[index.toString()];
        }

        // Add user to allUserInfo if not already present
        const alreadyExists = allUserInfo.some(user => user.path === userPath); 
        if (!alreadyExists) {
            allUserInfo.push({'path': userPath, 'color': userStyle.backgroundColor, "hidden": true});
        }
        
    
        // chrome.runtime.sendMessage({index: index, username: userPath, color: userStyle.backgroundColor});
    
        // Apply styling to all hyperlinks.
        hideUser(userPath, userStyle);
    });

    chrome.runtime.sendMessage({allUserInfo: allUserInfo, displayedUsers: displayedUsers});
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const userIndex = allUserInfo.findIndex(user => user.path === message.userPath); 
    allUserInfo[userIndex].hidden = !allUserInfo[userIndex].hidden;
    if (allUserInfo[userIndex].hidden === false) {
        showUser(message.userPath);
    }
    allUserInfo[userIndex].hidden ? hideUser(message.userPath, pageStyle.default) : showUser(message.userPath);
    sendResponse({hidden: allUserInfo[userIndex].hidden});
});

function showUser(userPath) {
    document.querySelectorAll(`a[href='${userPath}']`).forEach(element => {
        element.removeAttribute('style');
        for (let i = 0; i < element.children.length; i++) {
            element.children[i].removeAttribute('style');
        }
    });
}

function hideUser(userPath) {
    const userIndex = allUserInfo.findIndex(user => user.path === userPath)
    userColor = allUserInfo[userIndex].color;
    document.querySelectorAll(`a[href='${userPath}']`).forEach(element => {
        // Hide child elements.
        for (let i = 0; i < element.children.length; i++) {
            element.children[i].style.opacity = 0;
        }

        // Apply Styling.
        element.style.color = pageStyle.all.color;
        element.style.transition = pageStyle.all.transition;
        element.style.boxShadow= pageStyle.all.boxShadow;
        element.style.backgroundColor = userColor;
        

        // Profile pictures are circular and so have a border radius reflecting that.
        if (element.className === profilePictureClass) {
            element.style.borderRadius = '100%';
        } else {
            element.style.borderRadius = pageStyle.all.borderRadius;
        }
    }); 
}