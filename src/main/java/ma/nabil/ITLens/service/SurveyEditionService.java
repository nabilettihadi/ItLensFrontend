package ma.nabil.ITLens.service;

import ma.nabil.ITLens.dto.SurveyEditionDTO;

import java.util.List;

public interface SurveyEditionService extends GenericService<SurveyEditionDTO, Integer> {
    List<SurveyEditionDTO> getEditionsBySurveyId(Integer surveyId);
}