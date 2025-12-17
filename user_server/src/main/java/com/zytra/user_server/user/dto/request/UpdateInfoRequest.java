package com.zytra.user_server.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class UpdateInfoRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "DOB is required (YYYY-MM-DD)")
    private String dob;

}
