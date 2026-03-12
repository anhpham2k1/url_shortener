CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(150) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(120) NOT NULL,
                       role VARCHAR(20) NOT NULL,
                       plan VARCHAR(20) NOT NULL,
                       status VARCHAR(20) NOT NULL,
                       created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                       updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);