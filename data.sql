\c biztime

DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS companies_industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL
);


CREATE TABLE companies_industries (
    id serial PRIMARY KEY,
    company_code text REFERENCES companies ON DELETE CASCADE,
    industry_code text REFERENCES industries ON DELETE CASCADE
    -- PRIMARY KEY (company_code, industry_code)
);


INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('3m', 'mmm', 'Mining Manufacturing Minnesotta'),
         ('bb', 'best buy', 'tech big blue'),
         ('target', 'target', 'big red');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null),
         ('3m', 200, false, null),
         ('bb', 300, false, null);

INSERT INTO industries (code, industry)
  VALUES ('tech', 'technology'),
         ('med', 'medical'),
         ('ent', 'entertainment'),
         ('manf', 'manufacturing');


INSERT INTO companies_industries (company_code, industry_code)
  VALUES ('apple', 'tech'),
         ('apple', 'ent'),
         ('ibm', 'tech'),
         ('3m', 'med'),
         ('3m', 'manf');