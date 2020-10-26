CREATE TABLE company (
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    num_employees integer,
    description TEXT,
    logo_url TEXT
);

CREATE TABLE job (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    salary NUMERIC NOT NULL,
    equity NUMERIC NOT NULL,
    date_posted TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    company_handle TEXT NOT NULL REFERENCES company(handle)
);

CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    photo_url TEXT,
    is_admin boolean NOT NULL DEFAULT FALSE
);
