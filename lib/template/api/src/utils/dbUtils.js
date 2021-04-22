const isDuplicateDbKeyError = (err, key) => {
    // Code for MySQL: ER_DUP_ENTRY
    // Code for PostgreSQL: 23505
    const isDuplicateError = err.code === 'ER_DUP_ENTRY' || err.code === '23505';

    let isKeyError = false;

    if (isDuplicateError) {
        // Check if the key is the error
        // MySQL
        if (err.sqlMessage && err.sqlMessage.includes(key)) {
            isKeyError = true;
        }
        // PostgreSQL
        if (err.detail && err.detail.includes(key)) {
            isKeyError = true;
        }
    }

    return isDuplicateError && isKeyError;
};

module.exports = {
    isDuplicateDbKeyError,
};