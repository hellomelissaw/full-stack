// Functions to set, get and delete cookies - Inspired and copied from:
//   http://www.quirksmode.org/js/cookies.html

function setCookie(name, value, days) {
    if (name == undefined) {
        return null
    }
    let expires = "";
    let date = "";
    if (days == -1) {
        expires = "; expires= -1";
    } else {
        date = new Date();
        date.setTime(date.getTime() + (days+24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
    return 0;
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function delCookie(name) {
    if (name == undefined) {
        return null
    }
    setCookie(name, "", -1);
    return 0;
}

module.exports = { setCookie, getCookie, delCookie };
