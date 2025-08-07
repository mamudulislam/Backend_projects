class ApiError extends Error {
    constructor(
        statusCode, 
        message = 'An error occurred',
        errors = [],    // Use plural 'errors' to be consistent
        stack = ""      // Fix typo from 'statck' to 'stack'
    ) {
        super(message); 
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;  // Correct variable reference

        if (stack) {
            this.stack = stack;  // Fix typo here
        } else {
            Error.captureStackTrace(this, this.constructor); // Fix usage here
        }
    }
}

export { ApiError };
