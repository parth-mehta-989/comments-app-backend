CREATE TABLE IF NOT EXISTS av (
    id SERIAL PRIMARY KEY,
    data text NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone,
    username character varying(50) NOT NULL,
    parent_id integer REFERENCES comments(id)
);