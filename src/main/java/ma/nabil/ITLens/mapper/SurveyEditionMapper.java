package ma.nabil.ITLens.mapper;

import ma.nabil.ITLens.dto.SurveyEditionDTO;
import ma.nabil.ITLens.entity.SurveyEdition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {SubjectMapper.class})
public interface SurveyEditionMapper extends GenericMapper<SurveyEdition, SurveyEditionDTO> {
    @Override
    @Mapping(target = "surveyId", source = "survey.id")
    @Mapping(target = "subjects", source = "subjects")
    SurveyEditionDTO toDto(SurveyEdition surveyEdition);

    @Override
    @Mapping(target = "survey.id", source = "surveyId")
    @Mapping(target = "subjects", source = "subjects")
    SurveyEdition toEntity(SurveyEditionDTO dto);
}