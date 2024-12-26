package ma.nabil.ITLens.service.impl;

import lombok.extern.slf4j.Slf4j;
import ma.nabil.ITLens.dto.SurveyEditionDTO;
import ma.nabil.ITLens.entity.SurveyEdition;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.SurveyEditionMapper;
import ma.nabil.ITLens.repository.SurveyEditionRepository;
import ma.nabil.ITLens.repository.SurveyRepository;
import ma.nabil.ITLens.service.SurveyEditionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class SurveyEditionServiceImpl extends GenericServiceImpl<SurveyEdition, SurveyEditionDTO, Integer> implements SurveyEditionService {
    private final SurveyRepository surveyRepository;
    private final SurveyEditionRepository surveyEditionRepository;

    public SurveyEditionServiceImpl(
            SurveyEditionRepository repository,
            SurveyEditionMapper mapper,
            SurveyRepository surveyRepository) {
        super(repository, mapper);
        this.surveyRepository = surveyRepository;
        this.surveyEditionRepository = repository;
    }

    @Override
    public SurveyEditionDTO create(SurveyEditionDTO dto) {
        validateSurvey(dto.getSurveyId());
        SurveyEdition edition = mapper.toEntity(dto);
        edition.setCreationDate(new Date());
        SurveyEdition savedEdition = repository.save(edition);
        return mapper.toDto(savedEdition);
    }

    @Override
    public List<SurveyEditionDTO> getEditionsBySurveyId(Integer surveyId) {
        validateSurvey(surveyId);
        return surveyEditionRepository.findBySurveyId(surveyId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    protected String getEntityName() {
        return "SurveyEdition";
    }

    @Override
    protected void setEntityId(SurveyEdition entity, Integer id) {
        entity.setId(id);
    }

    private void validateSurvey(Integer surveyId) {
        if (!surveyRepository.existsById(surveyId)) {
            throw new ResourceNotFoundException("Survey", surveyId);
        }
    }
}