package ma.nabil.ITLens.service.impl;

import lombok.extern.slf4j.Slf4j;
import ma.nabil.ITLens.dto.AnswerDTO;
import ma.nabil.ITLens.dto.QuestionDTO;
import ma.nabil.ITLens.entity.Answer;
import ma.nabil.ITLens.entity.Question;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.QuestionMapper;
import ma.nabil.ITLens.repository.QuestionRepository;
import ma.nabil.ITLens.repository.SubjectRepository;
import ma.nabil.ITLens.service.QuestionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class QuestionServiceImpl extends GenericServiceImpl<Question, QuestionDTO, Integer> implements QuestionService {
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;

    public QuestionServiceImpl(
            QuestionRepository repository,
            QuestionMapper mapper,
            SubjectRepository subjectRepository) {
        super(repository, mapper);
        this.subjectRepository = subjectRepository;
        this.questionRepository = repository;
    }

    @Override
    public QuestionDTO createQuestion(QuestionDTO questionDTO) {
        validateSubject(questionDTO.getSubjectId());
        Question question = mapper.toEntity(questionDTO);
        question.setAnswerCount(0);

        if (question.getAnswers() != null) {
            question.getAnswers().forEach(answer -> {
                answer.setQuestion(question);
                answer.setSelectionCount(0);
                answer.setPercentage(0.0);
            });
        }

        Question savedQuestion = questionRepository.save(question);
        return mapper.toDto(savedQuestion);
    }

    @Override
    public QuestionDTO update(Integer id, QuestionDTO questionDTO) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", id));

        question.setText(questionDTO.getText());
        question.setType(questionDTO.getType());
        question.setAnswerCount(questionDTO.getAnswerCount());

        List<Answer> answers = question.getAnswers();
        answers.clear();
        for (AnswerDTO answerDTO : questionDTO.getAnswers()) {
            Answer answer = new Answer();
            answer.setText(answerDTO.getText());
            answer.setQuestion(question);
            answers.add(answer);
        }

        return mapper.toDto(questionRepository.save(question));
    }

    @Override
    public void delete(Integer id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", id));

        question.getAnswers().forEach(answer -> {
            answer.setQuestion(null);
        });

        questionRepository.delete(question);
    }

    @Override
    public List<QuestionDTO> getQuestionsBySubjectId(Integer subjectId) {
        validateSubject(subjectId);
        return questionRepository.findBySubjectId(subjectId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void incrementAnswerCount(Integer questionId) {
        if (!repository.existsById(questionId)) {
            throw new ResourceNotFoundException(getEntityName(), questionId);
        }
        questionRepository.incrementAnswerCount(questionId);
    }

    @Override
    protected String getEntityName() {
        return "Question";
    }

    @Override
    protected void setEntityId(Question entity, Integer id) {
        entity.setId(id);
    }

    private void validateSubject(Integer subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new ResourceNotFoundException("Subject", subjectId);
        }
    }
}