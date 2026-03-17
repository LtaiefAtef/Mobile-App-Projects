package com.auth.backend.config;

import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

public class JwtDecoderProvider {

    private static final String JWKS_URL =
        "http://localhost:8080/realms/mobile-realm/protocol/openid-connect/certs";

    public static JwtDecoder create() {
        return NimbusJwtDecoder.withJwkSetUri(JWKS_URL).build();
    }
}