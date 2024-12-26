package ma.nabil.ITLens.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GenericService<D, ID> {
    D create(D dto);

    D getById(ID id);

    Page<D> getAll(Pageable pageable);

    D update(ID id, D dto);

    void delete(ID id);
}