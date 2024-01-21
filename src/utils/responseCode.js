const success = (data) => {
    return {
        statusCode: 200,
        body: {
            responseCode: "00000",
            responseDesc: "Success",
            responseData: data || undefined,
        }
    };
};

const invalidData = (input) => {
    return {
        statusCode: 400,
        body: {
            responseCode: "00001",
            responseDesc: `${input} invalid.`
        }
    };
};

const customMessage = (desc) => {
    return {
        statusCode: 200,
        body: {
            responseCode: "00002",
            responseDesc: `${desc}`
        }
    };
};

const customError = (desc) => {
    return {
        statusCode: 400,
        body: {
            responseCode: "00008",
            responseDesc: `${desc}`
        }
    };
};

const internalError = (error) => {
    return {
        statusCode: 500,
        body: {
            responseCode: "00009",
            responseDesc: "Unexpected error.",
            responseError: error
        }
    }
};

module.exports = {
    success,
    invalidData,
    customError,
    customMessage,
    internalError,
};
