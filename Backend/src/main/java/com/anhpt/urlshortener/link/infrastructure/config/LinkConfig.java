package com.anhpt.urlshortener.link.infrastructure.config;

import com.anhpt.urlshortener.link.domain.service.ShortCodeGenerator;
import com.anhpt.urlshortener.link.domain.strategy.RandomShortCodeStrategy;
import com.anhpt.urlshortener.link.domain.strategy.ShortCodeStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LinkConfig {

    @Bean
    public ShortCodeStrategy shortCodeStrategy() {
        return new RandomShortCodeStrategy();
    }

    @Bean
    public ShortCodeGenerator shortCodeGenerator(ShortCodeStrategy strategy) {
        return strategy::generate;
    }
}
