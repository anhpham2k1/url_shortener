CREATE TABLE link_analytics (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    click_count BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_analytics_code_date UNIQUE (short_code, date)
);

CREATE INDEX idx_analytics_short_code ON link_analytics(short_code);
CREATE INDEX idx_analytics_date ON link_analytics(date);
