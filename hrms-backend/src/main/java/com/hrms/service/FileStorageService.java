
package com.hrms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String storeFile(MultipartFile file, String subPath) {
        try {
            Path targetLocation = Paths.get(uploadDir, subPath)
                    .toAbsolutePath().normalize();
            Files.createDirectories(targetLocation);

            String fileName = UUID.randomUUID() + "_" + 
                    StringUtils.cleanPath(file.getOriginalFilename());
            Path filePath = targetLocation.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            return filePath.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file", ex);
        }
    }
}