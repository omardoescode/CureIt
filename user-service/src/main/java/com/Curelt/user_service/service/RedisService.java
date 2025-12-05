package com.Curelt.user_service.service;

public interface RedisService {
    void setInRedis(String key, String value, long expirationInMinutes);
    String get(String key);
    Boolean hasKey(String key);
    void delete(String key);
}
