process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let id;
beforeEach( async() => {
    let companies = await db.query(
        `INSERT INTO companies
        VALUES 
        ('bbraun', 'medical', 'liquid.')`);
    let invoices = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES 
        ('bbraun', 100, false, null)
        RETURNING id`);
    /** assign id for testing */
    id = invoices.rows[0].id;
});

afterEach( async() => {
    id = null;
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
});

afterAll( async() => {
    await db.end();
});

describe('GET /invoices', () => {
    test('get all invoices in db', async() => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ 
            "invoices": [
                {
                    id,
                    "comp_code":"bbraun",
                    "amt":100,"paid":false,
                    "add_date":"2023-03-22T07:00:00.000Z",
                    "paid_date":null
                }
            ] 
        });
    })
});
