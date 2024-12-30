package ma.nabil.ITLens.service.impl;

import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import ma.nabil.ITLens.dto.SurveyDTO;
import ma.nabil.ITLens.entity.Survey;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.SurveyMapper;
import ma.nabil.ITLens.repository.OwnerRepository;
import ma.nabil.ITLens.repository.SurveyRepository;
import ma.nabil.ITLens.service.SurveyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class SurveyServiceImpl extends GenericServiceImpl<Survey, SurveyDTO, Integer> implements SurveyService {
    private final OwnerRepository ownerRepository;
    private final SurveyRepository surveyRepository;

    public SurveyServiceImpl(
            SurveyRepository repository,
            SurveyMapper mapper,
            OwnerRepository ownerRepository) {
        super(repository, mapper);
        this.ownerRepository = ownerRepository;
        this.surveyRepository = repository;
    }

    @Override
    public Page<SurveyDTO> getAll(Pageable pageable) {
        return surveyRepository.findAllWithEditions(pageable)
                .map(mapper::toDto);
    }

    @Override
    public Page<SurveyDTO> getSurveysByOwnerId(Integer ownerId, Pageable pageable) {
        if (!ownerRepository.existsById(ownerId)) {
            throw new ResourceNotFoundException("Owner", ownerId);
        }
        return surveyRepository.findByOwnerId(ownerId, pageable)
                .map(mapper::toDto);
    }

    @Override
    protected String getEntityName() {
        return "Survey";
    }

    @Override
    protected void setEntityId(Survey entity, Integer id) {
        entity.setId(id);
    }

    @Override
    protected void validateEntity(Survey entity) {
        if (entity.getOwner() == null || entity.getOwner().getId() == null) {
            throw new ValidationException("Owner is required");
        }
        if (!ownerRepository.existsById(entity.getOwner().getId())) {
            throw new ResourceNotFoundException("Owner", entity.getOwner().getId());
        }
    }
}