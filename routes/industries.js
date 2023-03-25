const router = require('express').Router();
const ExpressError = require('../expressError');
const db = require('../db');

/** GET /industries get all industries with company codes */
router.get('/', async( req, res, next ) => {
    try {
        let indCompResults = await db.query(
            `SELECT ind.industry, comp.code 
            FROM companies_industries AS comp_ind
            JOIN companies AS comp 
            ON comp.code = comp_ind.company_code
            JOIN industries AS ind 
            ON ind.code = comp_ind.industry_code`
        );
        
        return res.status(200).json({ Industries: indCompResults.rows})
    } catch ( err ) {
        return next( err );
    }
});


/** POST /industries adding an industry */
router.post('/', async( req, res, next ) => {
    try {
        let { code, industry } = req.body;
        console.log(code, industry)

        let results = await db.query(
            `INSERT INTO industries
            VALUES ( $1, $2 )
            RETURNING code, industry`,
            [ code, industry ]
        );
        console.log(results.rows)
        return res.status(201).json( { industry: results.rows })
    } catch ( err ) {
        if( err.code ) next( ExpressError.SQLCodeHandler( err ) );
        return next( err );
    }
});

/** POST /industries/:industrycode adding an company industry association */
router.post('/:industrycode', async( req, res, next ) => {
    try {
        let { company_code } = req.body;
        let { industrycode } = req.params;

        let results = await db.query(
            `INSERT INTO companies_industries
            VALUES ( $1, $2 )
            RETURNING company_code, industry_code`,
            [ company_code, industrycode ]
        );

        return res.status(201).json({ 
            industry: results.rows[0].industry_code, company:  results.rows[0].company_code
        });
    } catch ( err ) {
        if( err.code ) next( ExpressError.SQLCodeHandler( err ) );
        return next( err );
    }
});

/** DELETE /industries/:code deleting an industry  */
router.delete('/:code', async( req, res, next ) => {
    try {
        let { code } = req.params;
        let results = await db.query( `DELETE FROM industries WHERE code=$1`, [ code ] );
        if( results.rowCount === 0 ) throw new ExpressError(`${ code } does not exist in db`, 404);
        return res.status(200).json( { status: 'deleted' } );
    } catch ( err ) {
        return next( err );
    }
});


module.exports = router;