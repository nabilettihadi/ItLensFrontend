package ma.nabil.ITLens.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Survey API Documentation")
                        .version("1.0")
                        .description("API documentation for the Survey application")
                        .contact(new Contact()
                                .name("Nabil")
                                .email("nettihadi@gmail.com")));
    }
}