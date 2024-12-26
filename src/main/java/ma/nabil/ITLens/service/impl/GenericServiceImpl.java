package ma.nabil.ITLens.service.impl;

import lombok.RequiredArgsConstructor;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.GenericMapper;
import ma.nabil.ITLens.service.GenericService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
public abstract class GenericServiceImpl<E, D, ID> implements GenericService<D, ID> {

    protected final JpaRepository<E, ID> repository;
    protected final GenericMapper<E, D> mapper;

    @Override
    @Transactional
    public D create(D dto) {
        E entity = mapper.toEntity(dto);
        E savedEntity = repository.save(entity);
        return mapper.toDto(savedEntity);
    }

    @Override
    @Transactional
    public D update(ID id, D dto) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(getEntityName(), id);
        }
        E entity = mapper.toEntity(dto);
        setEntityId(entity, id);
        E updatedEntity = repository.save(entity);
        return mapper.toDto(updatedEntity);
    }

    @Override
    @Transactional
    public void delete(ID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(getEntityName(), id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public D getById(ID id) {
        E entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(getEntityName(), id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<D> getAll(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toDto);
    }

    protected abstract String getEntityName();

    protected abstract void setEntityId(E entity, ID id);
}