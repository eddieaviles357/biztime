/** jest companies.test.js */
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let id;
let code;
let name;
let description;
let industries;
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
    let invoicesRes = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES 
        ('bbraun', 100, false, null)
        RETURNING id, comp_code, amt, paid, paid_date, add_date`);
    /** assign id for testing */
    id = invoicesRes.rows[0].id;

    let indResults = await db.query(
        `INSERT INTO industries (code, industry)
        VALUES 
        ('tech', 'technology')
        RETURNING code, industry`
    );
    industries = indResults.rows;

    let com_ind = await db.query(
        `INSERT INTO companies_industries (company_code, industry_code)
        VALUES 
        ('bbraun', 'tech')`
    );
});

// clean up
afterEach( async() => {
    id = null;
    code = null;
    name = null;
    description = null;
    industries = null;
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM industries`);
    await db.query(`DELETE FROM companies_industries`);
});

// close the connection to db
afterAll( async() => {
    await db.end();
});

describe('GET /companies', () => {
    test('get all companies in db', async() => {
        const res = await request(app).get('/companies');
        let body = res.body;

        expect(res.statusCode).toBe(200);
        expect(body).toHaveProperty('companies', [ { code, name, description } ] );
    });
});

describe('GET /companies/:code', () => {
    test('get company by code', async() => {
        const res = await request(app).get(`/companies/${code}`);
        let body = res.body;
        expect(res.statusCode).toBe(200);
         expect(body).toHaveProperty('company', {
            code, 
            description, 
            "industries": ["technology"], 
            "invoices": [
                {
                    "add_date": "2023-03-24T07:00:00.000Z", 
                    "amt": 100, 
                    "code": "bbraun", 
                    id, 
                    "paid": false, 
                    "paid_date": null
                }
            ], 
            "name": "medical"
        })
    });

    test('try to get company with invalid code', async() => {
        const invCode = 'invcode'
        const res = await request(app).get(`/companies/${invCode}`);
        let body = res.body;

        expect(res.statusCode).toBe(404);
        expect(body).toHaveProperty('error', { 
            message: `${invCode} is not in db`,
            status: 404 
        } );
    });
});

describe('POST /companies/', () => {
    test('add a company to db', async() => {
        const code = name = 'target';
        const description = 'super store';
        const res = await request(app)
                        .post('/companies/')
                        .send( { code, name, description } );
        let body = res.body;

        expect(res.statusCode).toBe(201);
        expect(body).toHaveProperty('company', { code, name, description } );
    });

    test('try to add a company with duplicate name', async() => {
        const res = await request(app)
                        .post('/companies/')
                        .send( { code, name, description } );
        let body = res.body;

        expect(res.statusCode).toBe(404);
        expect(body).toHaveProperty('error', { 
            message: "Can't Enter Duplicate Fields",
            status: 404 
        } );
    });
});

describe('PUT /companies/:code', () => {
    test('update existing company data', async() => {
        const name = description = 'test';
        const res = await request(app)
                        .put(`/companies/${code}`)
                        .send({ name: 'test', description: 'test'});
        let body = res.body;

        expect(res.statusCode).toBe(200);
        expect(body).toHaveProperty('company', { 
            code,
            name,
            description
        } );
    });

    test('try to update company data that doesn"t exist', async() => {
        const code = name = description = 'dontexist';
        const res = await request(app)
                        .put('/companies/')
                        .send( { code, name, description } );
        let body = res.body;

        expect(res.statusCode).toBe(404);
        expect(body).toHaveProperty('error', { 
            message: "Not Found",
            status: 404 
        } );
    });
});


describe('DELETE /companies/:code', () => {
    test('delete an existing company', async() => {
        const res = await request(app).delete(`/companies/${code}`);
        const body = res.body;
        expect(res.statusCode).toBe(200);
        expect(body).toHaveProperty('status', 'deleted');
    });

    test('try to delete a company that does not exist', async() => {
        const invCode = 'test';
        const res = await request(app).delete(`/companies/${invCode}`);
        const body = res.body;
        expect(res.statusCode).toBe(404);
        expect(body).toHaveProperty('error', { 
            message: 'test does not exist in db',
            status: 404
            });
    });
});