package com.zytra.user_server.driver.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.driver.dto.UpdateDriverRequest;
import com.zytra.user_server.driver.dto.DriverDetailsResponse;
import com.zytra.user_server.driver.service.DriverService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/driver")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping("/{driverId}/details")
    public DriverDetailsResponse getDriverDetails(@PathVariable Long driverId) {
        return driverService.getDriverDetails(driverId);
    }

    @PutMapping("/{driverId}/update")
    public DriverDetailsResponse updateDriverInfo(
            @PathVariable Long driverId,
            @RequestBody @Valid UpdateDriverRequest request) {
        return driverService.updateDriverInfo(driverId, request);
    }
}
