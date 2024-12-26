package ma.nabil.ITLens;

import ma.nabil.ITLens.dto.OwnerDTO;
import ma.nabil.ITLens.dto.SurveyDTO;
import ma.nabil.ITLens.entity.Owner;
import ma.nabil.ITLens.entity.Survey;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.SurveyMapper;
import ma.nabil.ITLens.repository.OwnerRepository;
import ma.nabil.ITLens.repository.SurveyRepository;
import ma.nabil.ITLens.service.impl.SurveyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SurveyServiceImplTest {

    @Mock
    private SurveyRepository surveyRepository;

    @Mock
    private OwnerRepository ownerRepository;

    @Mock
    private SurveyMapper surveyMapper;

    @InjectMocks
    private SurveyServiceImpl surveyService;

    private Pageable pageable;
    private Survey survey;
    private SurveyDTO surveyDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        pageable = PageRequest.of(0, 10);
        survey = createSurvey();
        surveyDTO = createSurveyDTO();
    }

    @Test
    void testCreate() {
        when(ownerRepository.existsById(surveyDTO.getOwner().getId())).thenReturn(true);
        when(surveyMapper.toEntity(surveyDTO)).thenReturn(survey);
        when(surveyRepository.save(any(Survey.class))).thenReturn(survey);
        when(surveyMapper.toDto(survey)).thenReturn(surveyDTO);

        SurveyDTO result = surveyService.create(surveyDTO);

        assertNotNull(result);
        verify(surveyRepository).save(any(Survey.class));
        verify(surveyMapper).toDto(survey);
    }

    @Test
    void testGetSurveysByOwnerId() {
        Integer ownerId = 1;
        Page<Survey> surveyPage = new PageImpl<>(List.of(survey));
        when(ownerRepository.existsById(ownerId)).thenReturn(true);
        when(surveyRepository.findByOwnerId(ownerId, pageable)).thenReturn(surveyPage);
        when(surveyMapper.toDto(survey)).thenReturn(surveyDTO);

        Page<SurveyDTO> result = surveyService.getSurveysByOwnerId(ownerId, pageable);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(surveyRepository).findByOwnerId(ownerId, pageable);
        verify(surveyMapper).toDto(survey);
    }

    @Test
    void testGetById() {
        Integer id = 1;
        when(surveyRepository.findById(id)).thenReturn(Optional.of(survey));
        when(surveyMapper.toDto(survey)).thenReturn(surveyDTO);

        SurveyDTO result = surveyService.getById(id);

        assertNotNull(result);
        verify(surveyRepository).findById(id);
        verify(surveyMapper).toDto(survey);
    }

    @Test
    void testGetByIdNotFound() {

        Integer id = 1;
        when(surveyRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> surveyService.getById(id));
        verify(surveyRepository).findById(id);
    }

    private Survey createSurvey() {
        Survey survey = new Survey();
        survey.setId(1);
        survey.setTitle("Test Survey");
        survey.setDescription("Test Description");
        survey.setOwner(new Owner());
        return survey;
    }

    private SurveyDTO createSurveyDTO() {
        SurveyDTO dto = new SurveyDTO();
        dto.setId(1);
        dto.setTitle("Test Survey");
        dto.setDescription("Test Description");
        OwnerDTO ownerDTO = new OwnerDTO();
        ownerDTO.setId(1);
        dto.setOwner(ownerDTO);
        return dto;
    }
}