const router = require('express').Router();
const db = require('../db');

/** GET /companies/ */
router.get('/', async(req, res, next) => {
    try {
        let queryResult = await db.query('SELECT * FROM companies')
        res.status(200).json({companies: queryResult.rows})
    } catch (err) {
        next(err)
    }
})

module.exports = router;