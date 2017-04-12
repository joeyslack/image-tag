--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.2
-- Dumped by pg_dump version 9.6.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: clarifai; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE clarifai (
    id integer NOT NULL,
    meta character varying(112) NOT NULL,
    results character varying(10413) NOT NULL,
    tags character varying(254) NOT NULL,
    type character varying(5) NOT NULL,
    file character varying(110) NOT NULL,
    flare_id character varying(10) NOT NULL,
    service character varying(8) NOT NULL,
    probability character varying(381) NOT NULL,
    tags_probability character varying(611) NOT NULL,
    flare_created_at timestamp without time zone NOT NULL
);


ALTER TABLE clarifai OWNER TO root;

--
-- Name: imagga; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE imagga (
    id integer NOT NULL,
    results character varying(6476) NOT NULL,
    file character varying(110) NOT NULL,
    tags character varying(1320) NOT NULL,
    probability character varying(2309) NOT NULL,
    tags_probability character varying(3561) NOT NULL,
    flare_created_at timestamp without time zone NOT NULL,
    "user" character varying(10) NOT NULL,
    flare_id character varying(10) NOT NULL,
    views integer NOT NULL,
    hearts integer NOT NULL
);


ALTER TABLE imagga OWNER TO root;

--
-- Name: public; Type: ACL; Schema: -; Owner: root
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM root;
GRANT ALL ON SCHEMA public TO root;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

