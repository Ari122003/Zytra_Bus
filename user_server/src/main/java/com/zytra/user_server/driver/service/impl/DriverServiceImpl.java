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

    /**
     * Retrieves detailed information for a driver by ID.
     * Fetches driver details including name, email, phone, status, and assigned
     * route.
     * 
     * @param driverId the ID of the driver
     * @return DriverDetailsResponse containing driver information
     * @throws RuntimeException if driver is not found
     */
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

    /**
     * Updates driver information including name and phone number.
     * Validates driver existence and persists the updated information.
     * 
     * @param driverId the ID of the driver to update
     * @param request  the UpdateDriverRequest containing new name and phone
     * @return DriverDetailsResponse containing updated driver information
     * @throws RuntimeException if driver is not found
     */
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
