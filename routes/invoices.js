const router = require('express').Router();
const db = require('../db');
const ExpressError = require('../expressError');

/** GET /invoices get all invoices */
router.get('/', async( req, res, next ) => {
    try {
        return res.status(200).json({message: 'test'})
    } catch ( err ) {
        return next( err );
    }
})



module.exports = router;