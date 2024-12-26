package ma.nabil.ITLens.service;

import ma.nabil.ITLens.dto.SubjectDTO;

import java.util.List;

public interface SubjectService extends GenericService<SubjectDTO, Integer> {
    List<SubjectDTO> getRootSubjects(Integer surveyEditionId);

    List<SubjectDTO> getChildSubjects(Integer parentId);

    SubjectDTO addChildSubject(Integer parentId, SubjectDTO childDTO);
}