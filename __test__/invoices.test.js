/** jest invoices.test.js */
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
        let body = res.body
        
        expect(res.statusCode).toBe(200);
        expect(body).toHaveProperty('invoices', [
            {
                id,
                "comp_code":"bbraun",
                "amt":100,
                "paid":false,
                "add_date":"2023-03-22T07:00:00.000Z",
                "paid_date":null
            }
        ] );
    });
});


describe('GET /invoices/:id', () => {
    test('get an invoice by id', async() => {
        const res = await request(app).get(`/invoices/${id}`);
        const body = res.body

        expect(res.statusCode).toBe(200);
        expect(body).toHaveProperty('invoice', {
            id,
            amt: 100,
            paid: false,
            add_date: '2023-03-22T07:00:00.000Z',
            paid_date: null,
            code: 'bbraun',
            name: 'medical',
            description: 'liquid.'
          });
    });

    test('get an invoice by id', async() => {
        const invId = 0;
        const res = await request(app).get(`/invoices/${invId}`);
        const body = res.body

        expect(res.statusCode).toBe(404);
        expect(body).toHaveProperty('error', {
            message: `Id: ${invId} does not exist in DB`,
            status: 404
          });
    });
})