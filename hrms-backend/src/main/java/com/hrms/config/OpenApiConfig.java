
//com/hrms/config/OpenApiConfig.java
package com.hrms.config;

import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

@Configuration
@OpenAPIDefinition(
 info = @Info(
     title       = "HRMS API",
     version     = "1.0",
     description = "Human Resource Management System API"
 )
)
@SecurityScheme(
 name   = "bearerAuth",
 type   = SecuritySchemeType.HTTP,
 scheme = "bearer",
 bearerFormat = "JWT"
)
public class OpenApiConfig {}
