package ma.nabil.ITLens.validation.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import ma.nabil.ITLens.validation.validator.ExistsValidator;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ExistsValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Exists {
    String message() default "L'entité n'existe pas";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    Class<?> entity();
}