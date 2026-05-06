package com.devrats.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final ScoreWebSocketHandler scoreWebSocketHandler;

    public WebSocketConfig(ScoreWebSocketHandler scoreWebSocketHandler) {
        this.scoreWebSocketHandler = scoreWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(scoreWebSocketHandler, "/leaderboard/global").setAllowedOrigins("*");
    }
}
