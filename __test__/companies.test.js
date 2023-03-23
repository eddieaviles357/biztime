/** jest companies.test.js */
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let id;
let code;
let name;
let description;
beforeEach( async() => {
    let companies = await db.query(
        `INSERT INTO companies
        VALUES 
        ('bbraun', 'medical', 'liquid.')
        RETURNING code, name, description`);
    // assign data for testing
    let res = companies.rows[0];
    code = res.code;
    name = res.name;
    description = res.description;
    let invoices = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES 
        ('bbraun', 100, false, null)
        RETURNING id`);
    /** assign id for testing */
    id = invoices.rows[0].id;
});

// clean up
afterEach( async() => {
    id = null;
    code = null;
    name = null;
    description = null;
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
});

// close the connection to db
afterAll( async() => {
    await db.end();
});

describe('GET /companies', () => {
    test('get all companies in db', async() => {
        const res = await request(app).get('/companies');
        let body = res.body

        expect(res.statusCode).toBe(200);
        expect(body).toHaveProperty('companies', [ { code, name, description } ] );
    });
});
