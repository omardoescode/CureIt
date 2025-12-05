package com.Curelt.user_service.dto;

import com.Curelt.user_service.Validators.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserRegisterRequest(@Size(min=2 , max=20)
                                   String firstName,
                                  String lastName,
                                  @Email
                                   String email,
                                  @ValidPassword
                                   String password,
                                  String userName
                                  ) {
}
