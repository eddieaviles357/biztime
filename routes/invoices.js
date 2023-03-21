const router = require('express').Router();
const db = require('../db');
const ExpressError = require('../expressError');

/** GET /invoices get all invoices */
router.get('/', async( req, res, next ) => {
    try {
        let result = await db.query(`SELECT * FROM invoices`);
        return res.status(200).json( { invoices: result.rows } );
    } catch ( err ) {
        return next( err );
    }
});



module.exports = router;