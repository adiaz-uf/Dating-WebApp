CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE user (
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	username VARCHAR(50) UNIQUE NOT NULL,
	first_name VARCHAR(50),
	last_name VARCHAR(50),
	password VARCHAR(255) DEFAULT NULL,
	biography VARCHAR(500),
	profile_picture VARCHAR(255) DEFAULT NULL,
	fame_rating INTEGER DEFAULT 0,
	gender VARCHAR(30),
	sexual_preferences(30),
	active_account BOOLEAN DEFAULT FALSE,
	oauth BOOLEAN DEFAULT FALSE,
    refresh_token VARCHAR(2048) DEFAULT NULL,
    reset_pass_token VARCHAR(2048) DEFAULT NULL
);