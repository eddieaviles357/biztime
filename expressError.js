/** ExpressError extends the normal JS error so we can easily
 *  add a status when we make an instance of it.
 *
 *  The error-handling middleware will return this.
 */

class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
    if(!(process.env.NODE_ENV === 'test')) console.error(this.stack);
  };

  static SQLCodeHandler(err) {
    /** Handle SQL code Error */
    switch( err.code ) {
        /** Duplication error */
        case( "23505" ):
            return new ExpressError( "Can't Enter Duplicate Fields", 404 );
        case( "23503" ):
            return new ExpressError( "Not present in db", 404 );
        /** No data error */
        case("02000"):
            return new ExpressError( "No Data", 404 );
    };
  };

};



module.exports = ExpressError;