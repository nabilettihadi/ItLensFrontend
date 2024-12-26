package ma.nabil.ITLens;

import ma.nabil.ITLens.dto.SurveyEditionDTO;
import ma.nabil.ITLens.entity.Survey;
import ma.nabil.ITLens.entity.SurveyEdition;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.SurveyEditionMapper;
import ma.nabil.ITLens.repository.SurveyEditionRepository;
import ma.nabil.ITLens.repository.SurveyRepository;
import ma.nabil.ITLens.service.impl.SurveyEditionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SurveyEditionServiceImplTest {

    @Mock
    private SurveyEditionRepository surveyEditionRepository;

    @Mock
    private SurveyRepository surveyRepository;

    @Mock
    private SurveyEditionMapper surveyEditionMapper;

    @InjectMocks
    private SurveyEditionServiceImpl surveyEditionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreate() {

        SurveyEditionDTO dto = createSurveyEditionDTO();
        SurveyEdition edition = createSurveyEdition();
        when(surveyRepository.existsById(dto.getSurveyId())).thenReturn(true);
        when(surveyEditionMapper.toEntity(dto)).thenReturn(edition);
        when(surveyEditionRepository.save(any(SurveyEdition.class))).thenReturn(edition);
        when(surveyEditionMapper.toDto(edition)).thenReturn(dto);

        SurveyEditionDTO result = surveyEditionService.create(dto);

        assertNotNull(result);
        verify(surveyEditionRepository).save(any(SurveyEdition.class));
        verify(surveyEditionMapper).toDto(edition);
    }

    @Test
    void testGetEditionsBySurveyId() {
        Integer surveyId = 1;
        SurveyEdition edition = createSurveyEdition();
        SurveyEditionDTO editionDTO = createSurveyEditionDTO();
        when(surveyRepository.existsById(surveyId)).thenReturn(true);
        when(surveyEditionRepository.findBySurveyId(surveyId)).thenReturn(List.of(edition));
        when(surveyEditionMapper.toDto(edition)).thenReturn(editionDTO);

        List<SurveyEditionDTO> result = surveyEditionService.getEditionsBySurveyId(surveyId);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(surveyEditionRepository).findBySurveyId(surveyId);
        verify(surveyEditionMapper).toDto(edition);
    }

    @Test
    void testGetById() {
        Integer id = 1;
        SurveyEdition edition = createSurveyEdition();
        SurveyEditionDTO editionDTO = createSurveyEditionDTO();
        when(surveyEditionRepository.findById(id)).thenReturn(Optional.of(edition));
        when(surveyEditionMapper.toDto(edition)).thenReturn(editionDTO);

        SurveyEditionDTO result = surveyEditionService.getById(id);

        assertNotNull(result);
        verify(surveyEditionRepository).findById(id);
        verify(surveyEditionMapper).toDto(edition);
    }

    @Test
    void testGetByIdNotFound() {
        Integer id = 1;
        when(surveyEditionRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> surveyEditionService.getById(id));
        verify(surveyEditionRepository).findById(id);
    }

    private SurveyEdition createSurveyEdition() {
        SurveyEdition edition = new SurveyEdition();
        edition.setId(1);
        edition.setCreationDate(new Date());
        edition.setStartDate(new Date());
        edition.setYear(2024);
        edition.setSurvey(new Survey());
        return edition;
    }

    private SurveyEditionDTO createSurveyEditionDTO() {
        SurveyEditionDTO dto = new SurveyEditionDTO();
        dto.setId(1);
        dto.setCreationDate(new Date());
        dto.setStartDate(new Date());
        dto.setYear(2024);
        dto.setSurveyId(1);
        return dto;
    }
}