-- Driver Authentication Separation - Database Migration
-- Created: January 13, 2026
-- Purpose: Create separate refresh token table for driver authentication

-- Create driver_refresh_tokens table
CREATE TABLE driver_refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(512) NOT NULL UNIQUE,
    driver_id BIGINT NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    
    CONSTRAINT fk_driver_refresh_token_driver 
        FOREIGN KEY (driver_id) 
        REFERENCES drivers(id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_driver_refresh_token_hash ON driver_refresh_tokens(token_hash);
CREATE INDEX idx_driver_refresh_driver_id ON driver_refresh_tokens(driver_id);
CREATE INDEX idx_driver_refresh_expires_at ON driver_refresh_tokens(expires_at);

-- Add comments for documentation
COMMENT ON TABLE driver_refresh_tokens IS 'Stores refresh tokens for driver authentication with token rotation support';
COMMENT ON COLUMN driver_refresh_tokens.token_hash IS 'SHA-256 hash of the refresh token for security';
COMMENT ON COLUMN driver_refresh_tokens.driver_id IS 'Reference to the driver who owns this token';
COMMENT ON COLUMN driver_refresh_tokens.issued_at IS 'When the token was first created';
COMMENT ON COLUMN driver_refresh_tokens.expires_at IS 'When the token will expire (7 days from issue)';
COMMENT ON COLUMN driver_refresh_tokens.last_used_at IS 'Last time this token was used for refresh';
COMMENT ON COLUMN driver_refresh_tokens.revoked IS 'Whether this token has been manually revoked';
COMMENT ON COLUMN driver_refresh_tokens.device_info IS 'Optional device information for tracking';
COMMENT ON COLUMN driver_refresh_tokens.ip_address IS 'Optional IP address for security tracking';
