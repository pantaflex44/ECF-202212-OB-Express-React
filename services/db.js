const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const getOffset = (currentPage = 1, listPerPage = 10) => {
    return { index: (currentPage - 1) * [listPerPage], limit: listPerPage };
};

const emptyOrRows = (rows) => {
    if (!rows) {
        return [];
    }
    return rows;
};

const connection = async () => {
    const db_name = path.join(__dirname, "..", "data", "app.db");

    const connection = new sqlite3.Database(db_name, (err) => {
        if (err) throw Error(err.message);
    });

    return connection;
};

const query = async (sql, params = {}) => {
    const c = await connection();
    return new Promise(async (resolve, reject) => {
        c.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const execute = async (sql, params = {}) => {
    const c = await connection();
    return new Promise(async (resolve, reject) => {
        c.run(sql, params, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports = {
    connection,
    query,
    execute,
    getOffset,
    emptyOrRows
};
