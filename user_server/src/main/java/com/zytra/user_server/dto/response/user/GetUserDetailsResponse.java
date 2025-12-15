package com.zytra.user_server.dto.response.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetUserDetailsResponse {

    private String name;
    private String email;
    private String phone;
    private String dob;

}
