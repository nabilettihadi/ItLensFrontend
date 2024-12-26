package ma.nabil.ITLens.validation.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import ma.nabil.ITLens.validation.annotation.Exists;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ExistsValidator implements ConstraintValidator<Exists, Integer> {
    private final Map<Class<?>, JpaRepository<?, Integer>> repositories;
    private Class<?> entityClass;

    @Override
    public void initialize(Exists exists) {
        this.entityClass = exists.entity();
    }

    @Override
    public boolean isValid(Integer id, ConstraintValidatorContext context) {
        if (id == null) return true;
        JpaRepository<?, Integer> repository = repositories.get(entityClass);
        return repository != null && repository.existsById(id);
    }
}