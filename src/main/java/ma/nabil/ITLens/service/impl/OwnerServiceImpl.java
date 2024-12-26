package ma.nabil.ITLens.service.impl;

import lombok.extern.slf4j.Slf4j;
import ma.nabil.ITLens.dto.OwnerDTO;
import ma.nabil.ITLens.dto.SurveyDTO;
import ma.nabil.ITLens.entity.Owner;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.OwnerMapper;
import ma.nabil.ITLens.repository.OwnerRepository;
import ma.nabil.ITLens.service.OwnerService;
import ma.nabil.ITLens.service.SurveyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class OwnerServiceImpl extends GenericServiceImpl<Owner, OwnerDTO, Integer> implements OwnerService {
    private final SurveyService surveyService;

    public OwnerServiceImpl(
            OwnerRepository repository,
            OwnerMapper mapper,
            SurveyService surveyService) {
        super(repository, mapper);
        this.surveyService = surveyService;
    }

    @Override
    public Page<SurveyDTO> getOwnerSurveys(Integer ownerId, Pageable pageable) {
        if (!repository.existsById(ownerId)) {
            throw new ResourceNotFoundException(getEntityName(), ownerId);
        }
        return surveyService.getSurveysByOwnerId(ownerId, pageable);
    }

    @Override
    protected String getEntityName() {
        return "Owner";
    }

    @Override
    protected void setEntityId(Owner entity, Integer id) {
        entity.setId(id);
    }
}