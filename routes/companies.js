const router = require('express').Router();
const db = require('../db');
const slugify = require('slugify');
const ExpressError = require('../expressError');

/** GET /companies/ get all companies */
router.get('/', async( req, res, next ) => {
    try {
        let result = await db.query('SELECT * FROM companies');
        return res.status( 200 ).json( { companies: result.rows } );
    } catch ( err ) {
        return next( err );
    }
});



/** GET /companies/[code] get a company by [code] */
router.get('/:code', async( req, res, next ) => {
    try {
        const { code } = req.params;
        
        let compResult = await db.query(
            'SELECT code, name, description FROM companies WHERE code=$1', 
            [ code ]
            );

        /** Does not exist throw Error with a 404 status exit */
        if( compResult.rows[0] === undefined ) throw new ExpressError( `${ code } is not in db`, 404 );

        let invResults = await db.query(
            `SELECT id, amt, paid, add_date, paid_date, code 
            FROM companies com JOIN invoices inv 
            ON com.code = inv.comp_code 
            WHERE inv.comp_code = $1`,
             [ code ] );
        
        let indResults = await db.query(
            `SELECT ind.industry FROM companies_industries AS comp_ind
            JOIN companies AS comp ON comp.code = comp_ind.company_code
            JOIN industries AS ind ON ind.code = comp_ind.industry_code
            WHERE comp.code=$1`,
            [ code ] );
        
        // assign properties to company obj
        let company = compResult.rows[0];
        // assing invoices to company obj
        company.invoices = invResults.rows;
        // extract industries name as a new Array
        company.industries = indResults.rows.map( ({ industry }) => industry );
        return res.status(200).json( { company } );
    } catch (err) {
        return next(err);
    }
});



/** POST /companies/ add a company */
router.post('/', async( req, res, next ) => {
    try {
        const { code, name, description } = req.body;
        // replaces space with - also lower cases name
        let slugifiedName = slugify(name, { lower: true } );
        
        let result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES($1, $2, $3)
            RETURNING code, name, description`,
            [ code, slugifiedName, description ]
        );

        return res.status( 201 ).json( { company: result.rows[0] } )
    } catch ( err ) {
        /** Handle SQL code Error */
        if( err.code ) next( ExpressError.SQLCodeHandler( err ) );
        return next( err );
    }
});



/** PUT /companies/[code] update an existing company in db */
router.put('/:code', async( req, res, next ) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;

        let result = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code=$3
            RETURNING code, name, description`,
            [ name, description, code ]
            );

        if(result.rowCount === 0) throw new ExpressError(`${ code } does not exist in db`, 404);
        return res.status( 200 ).json( { company: result.rows[0] } )
    } catch (err) {
        /** Handle SQL code Error */
        if( err.code ) next( ExpressError.SQLCodeHandler( err ) );
        return next( err );
    }
});


/** DELETE /companies/[code]*/
router.delete('/:code', async( req, res, next ) => {
    try {
        const { code } = req.params;

        let result = await db.query(
            `DELETE FROM companies WHERE code=$1`,
            [ code ]
            );
            if(result.rowCount === 0) throw new ExpressError(`${ code } does not exist in db`, 404);
        return res.status(200).json( { status: "deleted" } )
    } catch (err) {
        /** Handle SQL code Error */
        if( err.code ) next( ExpressError.SQLCodeHandler( err ) );
        return next( err );
    }
});



module.exports = router;