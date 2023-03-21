const router = require('express').Router();
const db = require('../db');
const ExpressError = require('../expressError');

/** GET /companies/ get all companies */
router.get('/', async( req, res, next ) => {
    try {
        let queryRes = await db.query('SELECT * FROM companies');
        return res.status( 200 ).json( { companies: queryRes.rows } );
    } catch ( err ) {
        return next( err );
    }
});



/** GET /companies/[code] get a company by [code] */
router.get('/:code', async( req, res, next ) => {
    try {
        let { code } = req.params;
        let queryRes = await db.query(
            'SELECT code, name, description FROM companies WHERE code=$1', 
            [ code ]
            );
        /** Does not exist throw Error with a 404 status */
        if( queryRes.rows[0] === undefined ) throw new ExpressError( `${ code } is not in DB`, 404 ); 
        return res.status(200).json({company: queryRes.rows[0]});
    } catch (err) {
        return next(err);
    }
});



/** POST /companies/ add a company */
router.post('/', async( req, res, next ) => {
    try {
        let { code, name, description } = req.body;
        let queryRes = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES($1, $2, $3)
            RETURNING code, name, description`,
            [ code, name, description ]
        );
        return res.status( 201 ).json( { company: queryRes.rows[0] } )
    } catch ( err ) {
        /** Handle SQL code Error */
        if(err.code) {
            switch(err.code) {
                /** Duplication error */
                case("23505"):
                    return next(new ExpressError("Can't Enter Duplicate Fields", 404));
                /** No data error */
                case("02000"):
                    return next(new ExpressError("No Data", 404));
            }
        };
        
        return next( err );
    }
});



/**  */
module.exports = router;