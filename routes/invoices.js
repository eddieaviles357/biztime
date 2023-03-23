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
        const { id } = req.params;

        let result = await db.query(
            `SELECT id, amt, paid, add_date, paid_date, code, com.name, com.description 
            FROM companies com 
            JOIN invoices inv ON com.code = inv.comp_code 
            WHERE id=$1`,
            [ id ] );

            if(result.rowCount < 1) throw new ExpressError(`Id: ${ id } does not exist in db`, 404);
        return res.status( 200 ).json( { invoice: result.rows[0] } );
    } catch ( err ) {
        return next( err );
    }
});



/** POST /invoices */
router.post('/', async( req, res, next ) => {
    try {
        const { comp_code, amt } = req.body;

        let result = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES ($1, $2, false, null)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [ comp_code, amt ] );

        return res.status( 201 ).json( { invoices: result.rows[0] } );
    } catch ( err ) {
        /** Handle SQL code Error */
        if( err.code ) next( ExpressError.SQLCodeHandler( err ) );
        return next( err );
    }
});



/** PUT /invoices/[id] */
router.put('/:id', async( req, res, next ) => {
    try {
        const { amt } = req.body;
        const { id } = req.params;

        let result = await db.query(
            `UPDATE invoices SET amt=$1 
            WHERE id=$2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
            [ amt, id ] );

        if(result.rowCount < 1) throw new ExpressError(`Id: ${ id } does not exist in db`, 404);
        return res.status(200).json( { invoice: result.rows[0] } );
    } catch ( err ) {
        return next( err );
    }
});



/** DELETE /invoices/[id] */
router.delete('/:id', async( req, res, next ) => {
    try {
        let { id } = req.params;

        let result = await db.query(
        `DELETE FROM invoices
        WHERE id=$1`, 
        [ id ] );

        if(result.rowCount < 1) throw new ExpressError(`Id: ${ id } does not exist in db`, 404);
        return res.status(200).json( { status: "deleted" } );
    } catch ( err ) {
        return next( err );
    }
});



module.exports = router;