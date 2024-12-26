package ma.nabil.ITLens;

import ma.nabil.ITLens.dto.OwnerDTO;
import ma.nabil.ITLens.dto.SurveyDTO;
import ma.nabil.ITLens.entity.Owner;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.OwnerMapper;
import ma.nabil.ITLens.repository.OwnerRepository;
import ma.nabil.ITLens.service.SurveyService;
import ma.nabil.ITLens.service.impl.OwnerServiceImpl;
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
import static org.mockito.Mockito.*;

class OwnerServiceImplTest {

    @Mock
    private OwnerRepository ownerRepository;

    @Mock
    private OwnerMapper ownerMapper;

    @Mock
    private SurveyService surveyService;

    @InjectMocks
    private OwnerServiceImpl ownerService;

    private Pageable pageable;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        pageable = PageRequest.of(0, 10);
    }

    @Test
    void testGetById() {

        Integer id = 1;
        Owner owner = new Owner();
        OwnerDTO ownerDTO = new OwnerDTO();
        when(ownerRepository.findById(id)).thenReturn(Optional.of(owner));
        when(ownerMapper.toDto(owner)).thenReturn(ownerDTO);

        OwnerDTO result = ownerService.getById(id);

        assertNotNull(result);
        verify(ownerRepository).findById(id);
        verify(ownerMapper).toDto(owner);
    }

    @Test
    void testGetByIdNotFound() {

        Integer id = 1;
        when(ownerRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> ownerService.getById(id));
        verify(ownerRepository).findById(id);
    }

    @Test
    void testGetOwnerSurveys() {

        Integer ownerId = 1;
        Page<SurveyDTO> expectedPage = new PageImpl<>(List.of(new SurveyDTO()));
        when(ownerRepository.existsById(ownerId)).thenReturn(true);
        when(surveyService.getSurveysByOwnerId(ownerId, pageable)).thenReturn(expectedPage);

        Page<SurveyDTO> result = ownerService.getOwnerSurveys(ownerId, pageable);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(ownerRepository).existsById(ownerId);
        verify(surveyService).getSurveysByOwnerId(ownerId, pageable);
    }

    @Test
    void testGetOwnerSurveysOwnerNotFound() {

        Integer ownerId = 1;
        when(ownerRepository.existsById(ownerId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> ownerService.getOwnerSurveys(ownerId, pageable));
        verify(ownerRepository).existsById(ownerId);
        verifyNoInteractions(surveyService);
    }
}