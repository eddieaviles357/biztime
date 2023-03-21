const router = require('express').Router();
const db = require('../db');
const ExpressError = require('../expressError');

/** GET /companies/ */
router.get('/', async(req, res, next) => {
    try {
        let queryRes = await db.query('SELECT * FROM companies');
        return res.status(200).json({companies: queryRes.rows});
    } catch (err) {
        return next(err);
    }
});

/** GET /companies/[code] */
router.get('/:code', async(req, res, next) => {
    try {
        let {code} = req.params;
        let queryRes = await db.query('SELECT code, name, description FROM companies WHERE code=$1', [code]);
        /** Does not exist throw Error with a 404 status */
        if(queryRes.rows[0] === undefined) throw new ExpressError(`${code} is not in DB`, 404); 
        return res.status(200).json({company: queryRes.rows[0]});
    } catch (err) {
        return next(err)
    }
})

module.exports = router;