package ma.nabil.ITLens;

import ma.nabil.ITLens.dto.AnswerDTO;
import ma.nabil.ITLens.entity.Answer;
import ma.nabil.ITLens.entity.Question;
import ma.nabil.ITLens.entity.QuestionType;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.AnswerMapper;
import ma.nabil.ITLens.repository.AnswerRepository;
import ma.nabil.ITLens.repository.QuestionRepository;
import ma.nabil.ITLens.service.impl.AnswerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AnswerServiceImplTest {

    @Mock
    private AnswerRepository answerRepository;

    @Mock
    private AnswerMapper answerMapper;

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private AnswerServiceImpl answerService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        Question question = new Question();
        question.setId(1);
        question.setText("Sample question?");
        question.setType(QuestionType.CHOIX_UNIQUE);

        when(questionRepository.findById(1)).thenReturn(Optional.of(question));
    }

    @Test
    void testGetAnswersByQuestionId() {

        Integer questionId = 1;
        Answer answer = new Answer();
        AnswerDTO answerDTO = new AnswerDTO();
        when(questionRepository.existsById(questionId)).thenReturn(true);
        when(answerRepository.findByQuestionId(questionId)).thenReturn(List.of(answer));
        when(answerMapper.toDto(answer)).thenReturn(answerDTO);

        List<AnswerDTO> result = answerService.getAnswersByQuestionId(questionId);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(answerRepository).findByQuestionId(questionId);
        verify(answerMapper).toDto(answer);
    }

    @Test
    void testIncrementSelectionCount() {

        Integer answerId = 1;
        Answer answer = new Answer();
        Question question = new Question();
        answer.setQuestion(question);
        when(answerRepository.existsById(answerId)).thenReturn(true);
        when(answerRepository.findById(answerId)).thenReturn(Optional.of(answer));
        when(answerRepository.findByQuestionId(question.getId())).thenReturn(List.of(answer));

        answerService.incrementSelectionCount(answerId);

        verify(answerRepository).incrementSelectionCount(answerId);
        verify(answerRepository).save(any(Answer.class));
    }

    @Test
    void testGetById() {
        Integer id = 1;
        Answer answer = new Answer();
        AnswerDTO answerDTO = new AnswerDTO();
        when(answerRepository.findById(id)).thenReturn(Optional.of(answer));
        when(answerMapper.toDto(answer)).thenReturn(answerDTO);

        AnswerDTO result = answerService.getById(id);

        assertNotNull(result);
        verify(answerRepository).findById(id);
        verify(answerMapper).toDto(answer);
    }

    @Test
    void testGetByIdNotFound() {

        Integer id = 1;
        when(answerRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> answerService.getById(id));
        verify(answerRepository).findById(id);
    }

    @Test
    void testCreate() {
        AnswerDTO dto = new AnswerDTO();
        dto.setQuestionId(1);
        dto.setSelectionCount(1);
        Answer answer = new Answer();

        when(questionRepository.existsById(1)).thenReturn(true);
        when(answerMapper.toEntity(dto)).thenReturn(answer);
        when(answerRepository.save(any(Answer.class))).thenReturn(answer);
        when(answerMapper.toDto(answer)).thenReturn(dto);

        AnswerDTO result = answerService.create(dto);

        assertNotNull(result);
        verify(answerRepository).save(any(Answer.class));
        verify(answerMapper).toDto(answer);
    }
}