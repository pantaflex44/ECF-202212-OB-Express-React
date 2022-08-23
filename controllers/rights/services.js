const { query, execute, emptyOrRows, getColumnNames } = require("../../services/db");

/**
 * Clean right datas
 * @param {Object} right Right datas
 * @returns Cleaned right datas
 */
const cleanRight = (right) => {
    const { is_default, ...rest } = right;

    return {
        is_default: is_default === 1,
        ...rest
    };
};

/**
 * Delete all rights of an user account.
 * @param {number} accountId Unique identifier of an account.
 * @returns true, if no error, else, false
 */
const deleteAccountRights = async (accountId) => {
    try {
        await execute(`DELETE FROM account_right WHERE account_id = $account_id`, { $account_id: accountId });

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

/**
 * Get all rights.
 * @param {CallableFunction} fn Optionnal. Callback function to add conditions. Array of rights found in parameter of this callback function, return, array of filtered rights expected.
 * @param {number} start Optionnal. Index of the first row to get. -1, to get all rows.
 * @returns Array of all rights.
 */
const getRights = async (fn = null, start = -1) => {
    const s = isNaN(parseInt(start)) ? -1 : parseInt(start);
    const l = process.env.ITEMS_PER_PAGE;
    const limitQuery = s > -1 ? `LIMIT ${l} OFFSET ${s}` : "";

    const rows = emptyOrRows(await query(`SELECT * FROM rights ${limitQuery}`, {}));

    if (rows.length < 1) return [];

    let rights = [...rows];
    if (fn) rights = fn(rights);

    rights.map((right) => cleanRight(right));

    return rights;
};

/**
 * Get default rights.
 * @param {number} start Optionnal. Index of the first row to get. -1, to get all rows.
 * @returns Array of default rights.
 */
const getDefaultRights = async (start = -1) => {
    return await getRights((rights) => rights.filter((right) => right.is_default), start);
};

/**
 * Get all rights assigned to an account.
 * @param {number} accountId Unique identifier of an user account.
 * @param {number} start Optionnal. Index of the first row to get. -1, to get all rows.
 * @returns List of all account rights.
 */
const getAccountRights = async (accountId, start = -1) => {
    const rows = emptyOrRows(
        await query(`SELECT * FROM account_right WHERE account_id = $account_id`, { $account_id: accountId })
    );

    if (rows.length < 1) return [];

    const rightIds = rows.map((row) => row.right_id);

    return await getRights((rights) => rights.filter((right) => rightIds.includes(right.id)), start);
};

/**
 * Delete all stored rights and assign to an account all default rights.
 * @param {number} accountId Unique identifier of an user account.
 * @returns true, if no error, else, false
 */
const assignDefaultRights = async (accountId) => {
    const defaultRightIds = (await getDefaultRights()).map((right) => right.id);

    try {
        await deleteAccountRights(accountId);

        for (let id of defaultRightIds) {
            await execute(`INSERT INTO account_right (account_id, right_id) VALUES($account_id, $right_id);`, {
                $account_id: accountId,
                $right_id: id
            });
        }

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

module.exports = { deleteAccountRights, getRights, getDefaultRights, assignDefaultRights, getAccountRights };
