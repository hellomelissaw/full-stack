const Errors = {
    INVALID_MOVE: "Invalid location! Go back to where you were!",
    USER_NOT_FOUND: "This user is not registered, please try again."
    // etc 
}

function getErrorMessage(code) {
    return Errors[code];
}

module.exports = { getErrorMessage }