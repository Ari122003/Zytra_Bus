package com.zytra.user_server.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class GetUserDetailsResponse {

    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String dob;
    private String imageUrl;

}
