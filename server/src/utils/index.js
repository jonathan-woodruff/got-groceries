//check if the user sends a cookie. If so, return the token
exports.cookieExtractor = req => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['token'];
    }
    return token;
};