package com.zytra.user_server.driver.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.driver.dto.UpdateDriverRequest;
import com.zytra.user_server.driver.dto.DriverDetailsResponse;
import com.zytra.user_server.driver.entity.DriverEntity;
import com.zytra.user_server.driver.repository.DriverRepository;
import com.zytra.user_server.driver.service.DriverService;

@Service
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;

    public DriverServiceImpl(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public DriverDetailsResponse getDriverDetails(Long driverId) {
        DriverEntity driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        return new DriverDetailsResponse(
                "Driver details fetched successfully",
                driver.getId(),
                driver.getName(),
                driver.getEmail(),
                driver.getPhone(),
                driver.getStatus(),
                driver.getAssignedRoute() != null ? driver.getAssignedRoute().getId() : null);
    }

    @Override
    @Transactional
    public DriverDetailsResponse updateDriverInfo(Long driverId, UpdateDriverRequest request) {
        DriverEntity driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        driver.setName(request.getName());
        driver.setPhone(request.getPhone());

        driverRepository.save(driver);

        return new DriverDetailsResponse(
                "Driver information updated successfully",
                driver.getId(),
                driver.getName(),
                driver.getEmail(),
                driver.getPhone(),
                driver.getStatus(),
                driver.getAssignedRoute() != null ? driver.getAssignedRoute().getId() : null);
    }
}
