class QueryError extends Error {
    constructor(message){
        super(message);
    }
}

module.exports = QueryError;
