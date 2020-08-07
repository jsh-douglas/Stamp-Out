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

        window.needConverting = {
            // Retweet: Main User
            'div.css-1dbjc4n.r-156q2ks div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1wbh5a2.r-dnmrzs.r-1ny4l3l': {
                replacementTag: 'a',
                replacementClass: 'css-1dbjc4n r-1awozwy r-18u37iz r-1wbh5a2 r-dnmrzs r-1ny4l3l',
                replacementStyling: {
                    textDecoration: 'none'
                },
                relativeHandlePath: ['firstChild', 'nextSibling', 'firstChild', 'firstChild', 'innerHTML']
            },
            // Retweet: @User
            'div.css-1dbjc4n.r-156q2ks span.r-18u37iz > span.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0': {
                replacementTag: 'a',
                replacementClass: 'css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0',
                replacementStyling: {
                    textDecoration: 'none'
                },
                relativeHandlePath: ['innerHTML']
            }
        };

        // Elements that cannot be linked to a user's handle will be hidden as a last resort.
        window.needHiding = [
            // Thread: User Icon
            'div.css-1dbjc4n.r-jdbj7n.r-sdzlij.r-rs99b7.r-1p0dtai.r-1mi75qu.r-1d2f490.r-1ny4l3l.r-u8s1d.r-zchlnj.r-ipm5af',
            // In this photo tags
            'div.css-1dbjc4n.r-18u37iz.r-1g94qm0 > a.css-4rbku5.css-18t94o4.css-901oao.r-1re7ezh.r-1loqt21.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-qvutc0',
            // Media Tags
            'span.css-901oao.css-16my406.r-1re7ezh.r-1qd0xha.r-16dba41.r-ad9z0x.r-bcqeeo.r-qvutc0 > span.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0'
        ];

        window.userLinks = {
            // Main
            'a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l': {
                relativeAttributePath: []
            },
            // Profile Picture
            'a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-sdzlij.r-1loqt21.r-1adg3ll.r-ahm1il.r-1ny4l3l.r-1udh08x.r-o7ynqc.r-6416eg.r-13qz1uu': {
                relativeAttributePath: []
            },
            // *User* Retweeted
            'div.css-1dbjc4n.r-1habvwh.r-16y2uox.r-1wbh5a2 a.css-4rbku5.css-18t94o4.css-901oao.r-1re7ezh.r-1loqt21.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-qvutc0': {
                relativeAttributePath: ['firstElementChild', 'firstElementChild', 'firstElementChild']
            },
            // @User
            'div.css-1dbjc4n.r-xoduu5 > span.r-18u37iz > a.css-4rbku5.css-18t94o4.css-901oao.css-16my406.r-1n1174f.r-1loqt21.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0': {
                relativeAttributePath: []
            },
            // ISSUE: ALSO SELECTS HASHTAGS WITHIN RETWEETS, NO UNIQUE CLASS, USE FIRST CHAR OF CONTENT AS METHOD OF DIFFERENTIATING (# OR @)
            // Retweet: @User
            'div.css-1dbjc4n.r-156q2ks span.r-18u37iz > a.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0': {
                relativeAttributePath: []
            },
            // Retweet: Main
            'div.css-1dbjc4n.r-156q2ks a.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1wbh5a2.r-dnmrzs.r-1ny4l3l': {
                relativeAttributePath: []
            },
            // Replying to: *User*
            'div.css-901oao.r-1re7ezh.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-qvutc0 > div.css-1dbjc4n.r-xoduu5 > a.css-4rbku5.css-18t94o4.css-901oao.css-16my406.r-1n1174f.r-1loqt21.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0': {
                relativeAttributePath: []
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

    // Some elements that can be used to identify a user are not anchor tags,
    // this code creates an exact copy of the element but changes the tag.
    Object.keys(needConverting).forEach(querySelector => {
        let querySelectorInfo = needConverting[querySelector];
        
        document.querySelectorAll(querySelector).forEach(originalElement => {
            let replacementElement = document.createElement(querySelectorInfo.replacementTag);

            replacementElement.setAttribute('class', querySelectorInfo.replacementClass);

            let userHandle = originalElement;
            if (querySelectorInfo.relativeHandlePath.length !== 0) {
                querySelectorInfo.relativeHandlePath.forEach(attribute => {
                    userHandle = userHandle[attribute];
                });
            }

            replacementElement.setAttribute('href', `/${userHandle.slice(1)}`);

            replacementElement.innerHTML = originalElement.innerHTML;

            replacementElement.style.setProperty('text-decoration', querySelectorInfo.replacementStyling.textDecoration);

            originalElement.parentNode.replaceChild(replacementElement, originalElement);
        });
    });

    // Some elements cannot be linked to a user handle, as a last resort,
    // the following code will hide the element.
    needHiding.forEach(querySelector => {
        document.querySelectorAll(querySelector).forEach(element => {
            element.style.setProperty('background-color', '#FFFFFF');
            element.style.setProperty('color', '#FFFFFF');

        });
    });


    // Get all users present on page.
    document.querySelectorAll(Object.keys(userLinks)).forEach(hyperlink => {
        // The query selector below selectors users tagged within retweets and also hashtags within 
        // retweets as they share the same classes, this checks to see if the text is a hashtag and skips it if it is
        if (hyperlink.matches('div.css-1dbjc4n.r-156q2ks span.r-18u37iz > a.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0')) {
            if (hyperlink.innerHTML[0] === '#') {
                return;
            }
        }
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
}

// - - - - - - - - - - - - - - - - - - -
//  showUser() - Removes styling 
// - - - - - - - - - - - - - - - - - - -

function showUser(userPath) {
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

            // Show child elements.
            for (let i = 0; i < targetElement.children.length; i++) {
                targetElement.children[i].style.setProperty('opacity', 1);
            }

            // Remove Styling.
            targetElement.style.removeProperty('background-color');
            targetElement.style.removeProperty('border-radius');
            targetElement.style.removeProperty('box-shadow');
            targetElement.style.removeProperty('color');
        }

        
    });
}

// - - - - - - - - - - - - - - - - - - -
//  hideUser() - Applies custom styling
// - - - - - - - - - - - - - - - - - - -

function hideUser(userPath) {
    let userData = displayedUserData.find(user => user.path === userPath);
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
            // Adjust target element
            targetElement = element;
            if (relativeAttributePath.length !== 0) {
                relativeAttributePath.forEach(attribute => {
                    targetElement = targetElement[attribute];
                });
            }

            // Hide child elements
            for (let i = 0; i < targetElement.children.length; i++) {
                targetElement.children[i].style.setProperty('transition', pageStyle.all.transition);
                targetElement.children[i].style.setProperty('opacity', 0);
            }
        
            // Apply styling
            targetElement.style.setProperty('background-color', userData.color);
            targetElement.style.setProperty('box-shadow', pageStyle.all.boxShadow);
            targetElement.style.setProperty('color', pageStyle.all.color);
            targetElement.style.setProperty('transition', pageStyle.all.transition);
        
            // Profile pictures are circular and so have a matching border radius 
            if (targetElement.getAttribute('class') === profilePictureClass) {
                targetElement.style.setProperty('border-radius', '100%');
            } else {
                targetElement.style.setProperty('border-radius', pageStyle.all.borderRadius);
            }

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
