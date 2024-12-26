package ma.nabil.ITLens.mapper;

import ma.nabil.ITLens.dto.SubjectDTO;
import ma.nabil.ITLens.entity.Subject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {QuestionMapper.class})
public interface SubjectMapper extends GenericMapper<Subject, SubjectDTO> {
    @Override
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "surveyEditionId", source = "surveyEdition.id")
    @Mapping(target = "questions", source = "questions")
    @Mapping(target = "children", source = "children")
    SubjectDTO toDto(Subject subject);

    @Override
    @Mapping(target = "parent.id", source = "parentId")
    @Mapping(target = "surveyEdition.id", source = "surveyEditionId")
    @Mapping(target = "questions", source = "questions")
    @Mapping(target = "children", source = "children")
    Subject toEntity(SubjectDTO dto);
}