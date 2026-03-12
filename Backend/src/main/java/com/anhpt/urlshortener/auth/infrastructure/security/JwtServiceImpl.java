package com.anhpt.urlshortener.auth.infrastructure.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.anhpt.urlshortener.user.domain.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtServiceImpl implements JwtService {

    private final Algorithm algorithm;
    private final long expirationMinutes;

    public JwtServiceImpl(@Value("${app.security.jwt.secret}") String secret,
                          @Value("${app.security.jwt.expiration-minutes}") long expirationMinutes) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.expirationMinutes = expirationMinutes;
    }

    @Override
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        return JWT.create()
                .withSubject(String.valueOf(user.getId()))
                .withClaim("email", user.getEmail())
                .withClaim("role", user.getRole().name())
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(expiresAt))
                .sign(algorithm);
    }

    @Override
    public Long extractUserId(String token) {
        return Long.valueOf(verify(token).getSubject());
    }

    @Override
    public String extractEmail(String token) {
        return verify(token).getClaim("email").asString();
    }

    @Override
    public String extractRole(String token) {
        return verify(token).getClaim("role").asString();
    }

    @Override
    public boolean isValid(String token) {
        try {
            verify(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private DecodedJWT verify(String token) {
        return JWT.require(algorithm).build().verify(token);
    }
}
