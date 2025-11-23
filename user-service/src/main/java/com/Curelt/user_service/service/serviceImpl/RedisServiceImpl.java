package com.Curelt.user_service.service.serviceImpl;

import com.Curelt.user_service.service.RedisService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisServiceImpl implements RedisService {
    private final StringRedisTemplate stringRedisTemplate;

    public RedisServiceImpl(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }


    public void setInRedis(String key, String value, long expirationInMinutes) {
        stringRedisTemplate.opsForValue().set(key, value, expirationInMinutes, TimeUnit.MINUTES);
    }




    public String get(String key) {
        return stringRedisTemplate.opsForValue().get(key);
    }


    public Boolean hasKey(String key) {
        return stringRedisTemplate.hasKey(key);
    }


    public void delete(String key) {
        stringRedisTemplate.delete(key);
    }
}
