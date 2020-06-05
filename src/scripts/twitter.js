// // showUser('/jamescharles')

// function showUser(path) {
//     accounts.delete(path);
//     document.querySelectorAll(querySelector).forEach(element => {
//         elementPath = ( new URL(element.href) ).pathname;
//         // Get all elements with href matching the path to be removed 
//         if (elementPath === path) {
//             element.removeAttribute('style');
//             element.firstChild.removeAttribute('style');
//         } 
//     });
// }



const userLinks = 'a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l';
const profilePictureClass = 'css-4rbku5 css-18t94o4 css-1dbjc4n r-sdzlij r-1loqt21 r-1adg3ll r-ahm1il r-1ny4l3l r-1udh08x r-o7ynqc r-6416eg r-13qz1uu';

let style;

// Fetch styling.
chrome.storage.sync.get(['styling'], result => {
    style = result.styling;
    init();
});

function init() {
    let users = new Set();

    // Get all users present on page.
    document.querySelectorAll(userLinks).forEach(currentValue => {
        users.add( ( new URL(currentValue.href) ).pathname );
    });

    // Convert users set to array to allow for indexing with the forEach() function.
    Array.from(users).forEach((username, index) => {
        chrome.runtime.sendMessage({username: username});

        let userStyle;

        // Unique styling is available for a limited number of users, revert to default if number of users exceeds this limit.
        if (typeof(style[index.toString()]) === 'undefined') {
            userStyle = style.default;
        } else {
            userStyle = style[index.toString()];
        }

        // Apply styling to all hyperlinks.
        document.querySelectorAll(`a[href='${username}']`).forEach(tag => {
            tag.firstChild.style.opacity = 0;
            tag.style.transition = '1s, opacity 0.25s';
            tag.style.backgroundColor = userStyle['background-color'];
            tag.style.boxShadow= userStyle['box-shadow'];

            // Profile pictures are circular and so have a border radius reflecting that.
            if (tag.className === profilePictureClass) {
                tag.style.borderRadius = '100%';
            } else {
                tag.style.borderRadius = userStyle['border-radius'];
            }
        }); 
    });
}