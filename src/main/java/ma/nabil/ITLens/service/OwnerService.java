package ma.nabil.ITLens.service;

import ma.nabil.ITLens.dto.OwnerDTO;
import ma.nabil.ITLens.dto.SurveyDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OwnerService extends GenericService<OwnerDTO, Integer> {
    Page<SurveyDTO> getOwnerSurveys(Integer ownerId, Pageable pageable);
}