package ma.nabil.ITLens.mapper;

import ma.nabil.ITLens.dto.SurveyDTO;
import ma.nabil.ITLens.entity.Survey;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {OwnerMapper.class, SurveyEditionMapper.class})
public interface SurveyMapper extends GenericMapper<Survey, SurveyDTO> {
    @Override
    @Mapping(target = "owner", source = "owner")
    @Mapping(target = "editions", source = "editions")
    SurveyDTO toDto(Survey survey);

    @Override
    @Mapping(target = "owner", source = "owner")
    @Mapping(target = "editions", source = "editions")
    Survey toEntity(SurveyDTO dto);
}