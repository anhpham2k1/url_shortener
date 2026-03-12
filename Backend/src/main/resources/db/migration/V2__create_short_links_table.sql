CREATE TABLE short_links (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    original_url TEXT NOT NULL,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_link_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_link_user ON short_links(user_id);
CREATE INDEX idx_link_code ON short_links(short_code);
