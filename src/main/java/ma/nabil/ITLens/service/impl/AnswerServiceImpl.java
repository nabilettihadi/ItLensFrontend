package ma.nabil.ITLens.service.impl;

import lombok.extern.slf4j.Slf4j;
import ma.nabil.ITLens.dto.AnswerDTO;
import ma.nabil.ITLens.entity.Answer;
import ma.nabil.ITLens.entity.Question;
import ma.nabil.ITLens.entity.QuestionType;
import ma.nabil.ITLens.exception.InvalidAnswerException;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.AnswerMapper;
import ma.nabil.ITLens.repository.AnswerRepository;
import ma.nabil.ITLens.repository.QuestionRepository;
import ma.nabil.ITLens.service.AnswerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class AnswerServiceImpl extends GenericServiceImpl<Answer, AnswerDTO, Integer> implements AnswerService {
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    public AnswerServiceImpl(
            AnswerRepository repository,
            AnswerMapper mapper,
            QuestionRepository questionRepository) {
        super(repository, mapper);
        this.questionRepository = questionRepository;
        this.answerRepository = repository;
    }

    @Override
    public AnswerDTO create(AnswerDTO answerDTO) {
        Question question = questionRepository.findById(answerDTO.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question", answerDTO.getQuestionId()));

        if (question.getType() == QuestionType.CHOIX_UNIQUE && answerDTO.getSelectionCount() > 1) {
            throw new InvalidAnswerException("Pour une question à choix unique, une seule réponse est autorisée.");
        }

        Answer answer = mapper.toEntity(answerDTO);
        answer.setQuestion(question);

        answerRepository.save(answer);

        return mapper.toDto(answer);
    }

    @Override
    public List<AnswerDTO> getAnswersByQuestionId(Integer questionId) {
        validateQuestion(questionId);
        return answerRepository.findByQuestionId(questionId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void incrementSelectionCount(Integer answerId) {
        if (!repository.existsById(answerId)) {
            throw new ResourceNotFoundException(getEntityName(), answerId);
        }
        answerRepository.incrementSelectionCount(answerId);
        updateAnswerPercentages(answerId);
    }

    @Override
    protected String getEntityName() {
        return "Answer";
    }

    @Override
    protected void setEntityId(Answer entity, Integer id) {
        entity.setId(id);
    }

    private void validateQuestion(Integer questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new ResourceNotFoundException("Question", questionId);
        }
    }

    private void updateAnswerPercentages(Integer answerId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException(getEntityName(), answerId));

        List<Answer> questionAnswers = answerRepository.findByQuestionId(answer.getQuestion().getId());
        int totalSelections = questionAnswers.stream()
                .mapToInt(Answer::getSelectionCount)
                .sum();

        questionAnswers.forEach(a -> {
            double percentage = totalSelections > 0
                    ? (a.getSelectionCount() * 100.0) / totalSelections
                    : 0.0;
            a.setPercentage(percentage);
            answerRepository.save(a);
        });
    }
}