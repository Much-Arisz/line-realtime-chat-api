const responseCode = require("./responseCode");

const handleError = (logSessionText, error) => {
    console.error(logSessionText, "error:", error.message ?? JSON.stringify(error));
    if (error.hasOwnProperty("statusCode") && error.hasOwnProperty("body") ) return error;
    else return responseCode.internalError(error.message);
}

module.exports = handleError;