package ma.nabil.ITLens.mapper;

import ma.nabil.ITLens.dto.AnswerDTO;
import ma.nabil.ITLens.entity.Answer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AnswerMapper extends GenericMapper<Answer, AnswerDTO> {
    @Override
    @Mapping(target = "questionId", source = "question.id")
    AnswerDTO toDto(Answer answer);

    @Override
    @Mapping(target = "question.id", source = "questionId")
    Answer toEntity(AnswerDTO dto);
}