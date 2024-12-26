package ma.nabil.ITLens.service;

import ma.nabil.ITLens.dto.AnswerDTO;

import java.util.List;

public interface AnswerService extends GenericService<AnswerDTO, Integer> {
    List<AnswerDTO> getAnswersByQuestionId(Integer questionId);

    void incrementSelectionCount(Integer answerId);
}