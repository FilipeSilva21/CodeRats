package com.devrats.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtProvider {

    private final Algorithm algorithm;
    private final String issuer = "devrats";
    private final String audience = "devrats-users";
    private final long expiration;
    private final long refreshExpiration;

    /**
     * Full constructor used by Spring with all @Value params.
     */
    @org.springframework.beans.factory.annotation.Autowired
    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration,
            @Value("${jwt.refreshExpiration}") long refreshExpiration) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.expiration = expiration;
        this.refreshExpiration = refreshExpiration;
    }

    /**
     * Simplified constructor for unit tests (no Spring context needed).
     */
    public JwtProvider(String secret, long expiration) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.expiration = expiration;
        this.refreshExpiration = expiration * 7;
    }

    public String generateAccessToken(String userId) {
        return JWT.create()
                .withIssuer(issuer)
                .withAudience(audience)
                .withClaim("userId", userId)
                .withExpiresAt(new Date(System.currentTimeMillis() + expiration))
                .sign(algorithm);
    }

    /**
     * Test-compatible generateToken(Long) that delegates to generateAccessToken.
     */
    public String generateToken(Long userId) {
        return generateAccessToken(String.valueOf(userId));
    }

    /**
     * Test-compatible generateToken(String) that delegates to generateAccessToken.
     */
    public String generateToken(String userId) {
        return generateAccessToken(userId);
    }

    public String generateRefreshToken(String userId) {
        return JWT.create()
                .withIssuer(issuer)
                .withClaim("userId", userId)
                .withClaim("type", "refresh")
                .withExpiresAt(new Date(System.currentTimeMillis() + refreshExpiration))
                .sign(algorithm);
    }

    public DecodedJWT verifyToken(String token) {
        return JWT.require(algorithm)
                .withIssuer(issuer)
                .build()
                .verify(token);
    }

    /**
     * Validates a token, returning true if valid and not expired.
     */
    public boolean validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        try {
            verifyToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        String id = getUserIdAsString(token);
        try {
            return Long.parseLong(id);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * String-based extraction for app usage (UUIDs).
     */
    public String getUserIdAsString(String token) {
        return verifyToken(token).getClaim("userId").asString();
    }
}
