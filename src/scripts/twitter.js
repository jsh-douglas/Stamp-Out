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
        // window.userLink = [
        //     'a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l', 
        //     'div[class="css-1dbjc4n"] > a.css-4rbku5.css-18t94o4.css-901oao.r-1re7ezh.r-1loqt21.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-qvutc0',
        //     'div.css-1dbjc4n.r-xoduu5 > span.r-18u37iz > a.css-4rbku5.css-18t94o4.css-901oao.css-16my406.r-daml9f.r-1loqt21.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0'
        // ];

        // Main
        // Retweet
        // Tag
        // Retweed User
        // Retweet tagged
        // Profile Picture
        // Replying to
        window.userLinks = {
            'a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l': {
                relativeAttributePath: [],
                hideMethod: 'standard'
            },
            'div[class="css-1dbjc4n"] > a.css-4rbku5.css-18t94o4.css-901oao.r-1re7ezh.r-1loqt21.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-qvutc0': {
                relativeAttributePath: ['firstElementChild', 'firstElementChild', 'firstElementChild'],
                hideMethod: 'standard'
            },
            'div.css-1dbjc4n.r-xoduu5 > span.r-18u37iz > a.css-4rbku5.css-18t94o4.css-901oao.css-16my406.r-daml9f.r-1loqt21.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0': {
                relativeAttributePath: [],
                hideMethod: 'standard'
            },
            'div.css-1dbjc4n.r-156q2ks a.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1wbh5a2.r-dnmrzs.r-1ny4l3l': {
                relativeAttributePath: [],
                hideMethod: 'standard'
            },
            'div.css-1dbjc4n.r-156q2ks span.r-18u37iz > a.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0': {
                relativeAttributePath: [],
                hideMethod: 'standard'
            },
            'a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-sdzlij.r-1loqt21.r-1adg3ll.r-ahm1il.r-1ny4l3l.r-1udh08x.r-o7ynqc.r-6416eg.r-13qz1uu': {
                relativeAttributePath: [],
                hideMethod: 'standard'
            }
        };
        window.profilePictureClass = 'css-4rbku5 css-18t94o4 css-1dbjc4n r-sdzlij r-1loqt21 r-1adg3ll r-ahm1il r-1ny4l3l r-1udh08x r-o7ynqc r-6416eg r-13qz1uu';

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

    // Rewteet handles don't use hyperlinks, to fix this, 
    // the following code will get the appropriate div and 
    // copy all data to a hyperlink tag and replace the element
    document.querySelectorAll('div.css-1dbjc4n.r-156q2ks div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1wbh5a2.r-dnmrzs.r-1ny4l3l').forEach(retweetUserElement => {
        let replacementElement = document.createElement('a');
        replacementElement.setAttribute('class', 'css-1dbjc4n r-1awozwy r-18u37iz r-1wbh5a2 r-dnmrzs r-1ny4l3l');
        replacementElement.setAttribute('href', `/${retweetUserElement.children[1].firstChild.firstChild.innerHTML.slice(1)}`);
        replacementElement.style.setProperty('text-decoration', 'none');
        replacementElement.innerHTML = retweetUserElement.innerHTML;
        retweetUserElement.parentNode.replaceChild(replacementElement, retweetUserElement);
    });

    // Tags within retweets
    document.querySelectorAll('div.css-1dbjc4n.r-156q2ks span.r-18u37iz > span.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0').forEach(retweetUserElement => {
        let replacementElementB = document.createElement('a');
        replacementElementB.setAttribute('class', 'css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0');
        replacementElementB.setAttribute('href', `/${retweetUserElement.innerHTML.slice(1)}`);
        replacementElementB.style.setProperty('text-decoration', 'none');
        replacementElementB.innerHTML = retweetUserElement.innerHTML;
        retweetUserElement.parentNode.replaceChild(replacementElementB, retweetUserElement);
    });

    document.querySelectorAll('span.css-901oao.css-16my406.css-cens5h.r-1re7ezh.r-1qd0xha.r-n6v787.r-16dba41.r-1sf4r6n.r-bcqeeo.r-qvutc0 > span.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0 > span.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0');

    // Get all users present on page.
    document.querySelectorAll(Object.keys(userLinks)).forEach(hyperlink => {
        // Use hyperlink to get user's account name
        let userPath = (new URL(hyperlink.href)).pathname;
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

    // document.querySelectorAll(`div.css-1dbjc4n.r-156q2ks 
    // div.css-901oao.css-bfa6kz.r-1re7ezh.r-18u37iz.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-qvutc0 > 
    // span.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0`).forEach(userHandle => {

    // });
            

}

// - - - - - - - - - - - - - - - - - - -
//  showUser() - Removes styling 
// - - - - - - - - - - - - - - - - - - -

function showUser(userPath) {
    document.querySelectorAll(`a[href='${userPath}']`).forEach(element => {
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
    window.userData = displayedUserData.find(user => user.path === userPath);
    document.querySelectorAll(`a[href='${userPath}']`).forEach(element => {
        
        let relativeAttributePath;
        let targetQuerySelector;
        Object.keys(userLinks).forEach(querySelector => {
            if (element.matches(querySelector)) {
                targetQuerySelector = querySelector;
                relativeAttributePath = userLinks[querySelector].relativeAttributePath;
            }
        });
        
        if (typeof relativeAttributePath !== 'undefined') {
            targetElement = element;
            if (relativeAttributePath.length !== 0) {
                relativeAttributePath.forEach(attribute => {
                    targetElement = targetElement[attribute];
                });
            }

            switch (userLinks[targetQuerySelector].hideMethod) {
                case 'standard':
                    for (let i = 0; i < targetElement.children.length; i++) {
                        targetElement.children[i].style.setProperty('transition', pageStyle.all.transition);
                        targetElement.children[i].style.setProperty('opacity', 0);
                    }
                
                    // Apply Styling.
                    targetElement.style.setProperty('background-color', userData.color);
                    targetElement.style.setProperty('box-shadow', pageStyle.all.boxShadow);
                    targetElement.style.setProperty('color', pageStyle.all.color);
                    targetElement.style.setProperty('transition', pageStyle.all.transition);
                
                    // Profile pictures are circular and so have a border radius reflecting that.
                    if (targetElement.getAttribute('class') === profilePictureClass) {
                        targetElement.style.setProperty('border-radius', '100%');
                    } else {
                        targetElement.style.setProperty('border-radius', pageStyle.all.borderRadius);
                    }
                    break;
                case 'like':
                    break;
            }
            // Hide child elements.
            
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
