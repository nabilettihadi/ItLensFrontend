package ma.nabil.ITLens.service;

import ma.nabil.ITLens.dto.SurveyDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SurveyService extends GenericService<SurveyDTO, Integer> {
    Page<SurveyDTO> getSurveysByOwnerId(Integer ownerId, Pageable pageable);
}