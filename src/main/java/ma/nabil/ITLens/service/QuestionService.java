package ma.nabil.ITLens.service;

import ma.nabil.ITLens.dto.QuestionDTO;

import java.util.List;

public interface QuestionService extends GenericService<QuestionDTO, Integer> {
    List<QuestionDTO> getQuestionsBySubjectId(Integer subjectId);

    void incrementAnswerCount(Integer questionId);

    QuestionDTO createQuestion(QuestionDTO questionDTO);
}