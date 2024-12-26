package ma.nabil.ITLens.mapper;

import ma.nabil.ITLens.dto.QuestionDTO;
import ma.nabil.ITLens.entity.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {AnswerMapper.class})
public interface QuestionMapper extends GenericMapper<Question, QuestionDTO> {
    @Override
    @Mapping(target = "subjectId", source = "subject.id")
    @Mapping(target = "answers", source = "answers")
    QuestionDTO toDto(Question question);

    @Override
    @Mapping(target = "subject.id", source = "subjectId")
    @Mapping(target = "answers", source = "answers")
    Question toEntity(QuestionDTO dto);
}