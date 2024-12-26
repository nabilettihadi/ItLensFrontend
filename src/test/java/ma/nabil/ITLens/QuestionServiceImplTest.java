package ma.nabil.ITLens;

import ma.nabil.ITLens.dto.QuestionDTO;
import ma.nabil.ITLens.entity.Question;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.QuestionMapper;
import ma.nabil.ITLens.repository.QuestionRepository;
import ma.nabil.ITLens.repository.SubjectRepository;
import ma.nabil.ITLens.service.impl.QuestionServiceImpl;
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

class QuestionServiceImplTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private QuestionMapper questionMapper;

    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private QuestionServiceImpl questionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateQuestion() {

        QuestionDTO dto = new QuestionDTO();
        dto.setSubjectId(1);
        Question question = new Question();
        when(subjectRepository.existsById(1)).thenReturn(true);
        when(questionMapper.toEntity(dto)).thenReturn(question);
        when(questionRepository.save(any(Question.class))).thenReturn(question);
        when(questionMapper.toDto(question)).thenReturn(dto);

        QuestionDTO result = questionService.createQuestion(dto);

        assertNotNull(result);
        verify(questionRepository).save(any(Question.class));
        verify(questionMapper).toDto(question);
    }

    @Test
    void testGetQuestionsBySubjectId() {

        Integer subjectId = 1;
        Question question = new Question();
        QuestionDTO questionDTO = new QuestionDTO();
        when(subjectRepository.existsById(subjectId)).thenReturn(true);
        when(questionRepository.findBySubjectId(subjectId)).thenReturn(List.of(question));
        when(questionMapper.toDto(question)).thenReturn(questionDTO);

        List<QuestionDTO> result = questionService.getQuestionsBySubjectId(subjectId);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(questionRepository).findBySubjectId(subjectId);
        verify(questionMapper).toDto(question);
    }

    @Test
    void testIncrementAnswerCount() {
        Integer questionId = 1;
        when(questionRepository.existsById(questionId)).thenReturn(true);

        questionService.incrementAnswerCount(questionId);

        verify(questionRepository).incrementAnswerCount(questionId);
    }

    @Test
    void testGetById() {

        Integer id = 1;
        Question question = new Question();
        QuestionDTO questionDTO = new QuestionDTO();
        when(questionRepository.findById(id)).thenReturn(Optional.of(question));
        when(questionMapper.toDto(question)).thenReturn(questionDTO);

        QuestionDTO result = questionService.getById(id);

        assertNotNull(result);
        verify(questionRepository).findById(id);
        verify(questionMapper).toDto(question);
    }

    @Test
    void testGetByIdNotFound() {
        Integer id = 1;
        when(questionRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> questionService.getById(id));
        verify(questionRepository).findById(id);
    }
}