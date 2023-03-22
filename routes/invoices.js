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

/** GET /invoices/[id] */
router.get('/:id', async( req, res, next ) => {
    try {
        let { id } = req.params;
        let result = await db.query(`
            SELECT id, amt, paid, add_date, paid_date, code, com.name, com.description 
            FROM companies com 
            JOIN invoices inv ON com.code = inv.comp_code 
            WHERE id=$1
            `, [ id ] );
            if(result.rowCount < 1) throw new ExpressError(`Id: ${ id } does not exist in DB`, 404);
        return res.status( 200 ).json( { invoice: result.rows[0] } );
    } catch ( err ) {
        return next( err );
    }
});


/** POST /invoices */
router.post('/', async( req, res, next ) => {

});
/** PUT /invoices/[id] */
router.put('/:id', async( req, res, next ) => {

});

/** DELETE /invoices/[id] */
router.delete('/:id', async( req, res, next ) => {

});
/** GET /companies/[code] */
router.get('/:code', async( req, res, next ) => {

});


module.exports = router;