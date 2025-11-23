package com.Curelt.user_service.mapper;

import com.Curelt.user_service.dto.UserRegisterRequest;
import com.Curelt.user_service.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {
    @Mapping(target = "role", ignore = true)
    User toUser(UserRegisterRequest userRequest);
}
