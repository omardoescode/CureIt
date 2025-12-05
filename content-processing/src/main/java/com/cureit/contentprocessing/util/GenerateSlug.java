package com.cureit.contentprocessing.util;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class GenerateSlug {
    public String generate(String str) {
        String baseSlug = str
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        String uuid = UUID.randomUUID().toString();

        return baseSlug + "-" + uuid;
    }
}
