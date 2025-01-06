package ma.nabil.ITLens.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import ma.nabil.ITLens.dto.SubjectDTO;
import ma.nabil.ITLens.entity.Subject;
import ma.nabil.ITLens.entity.SurveyEdition;
import ma.nabil.ITLens.exception.InvalidSubjectException;
import ma.nabil.ITLens.exception.ResourceNotFoundException;
import ma.nabil.ITLens.mapper.SubjectMapper;
import ma.nabil.ITLens.repository.SubjectRepository;
import ma.nabil.ITLens.repository.SurveyEditionRepository;
import ma.nabil.ITLens.service.SubjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class SubjectServiceImpl extends GenericServiceImpl<Subject, SubjectDTO, Integer> implements SubjectService {
    private final SubjectRepository subjectRepository;
    private final SurveyEditionRepository surveyEditionRepository;

    public SubjectServiceImpl(SubjectRepository repository, SubjectMapper mapper, SurveyEditionRepository surveyEditionRepository) {
        super(repository, mapper);
        this.subjectRepository = repository;
        this.surveyEditionRepository = surveyEditionRepository;
    }

    @Override
public SubjectDTO create(SubjectDTO subjectDTO) {
    // Récupérer l'édition de sondage
    SurveyEdition surveyEdition = surveyEditionRepository.findById(subjectDTO.getSurveyEditionId())
            .orElseThrow(() -> new ResourceNotFoundException("SurveyEdition", subjectDTO.getSurveyEditionId()));

    // Convertir le DTO en entité
    Subject subject = mapper.toEntity(subjectDTO);
    subject.setSurveyEdition(surveyEdition);

    // Gérer le parent si présent
    if (subjectDTO.getParentId() != null) {
        Subject parentSubject = subjectRepository.findById(subjectDTO.getParentId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent Subject", subjectDTO.getParentId()));
        
        // Vérifier que le parent appartient à la même édition de sondage
        if (!parentSubject.getSurveyEdition().getId().equals(surveyEdition.getId())) {
            throw new InvalidSubjectException("Le sujet parent doit avoir le même ID d'édition d'enquête.");
        }
        
        // Sauvegarder le parent d'abord si nécessaire
        if (parentSubject.getId() == null) {
            parentSubject = subjectRepository.save(parentSubject);
        }
        
        subject.setParent(parentSubject);
    } else {
        // Explicitement définir le parent à null si aucun parent n'est fourni
        subject.setParent(null);
    }

    // Sauvegarder le sujet
    Subject savedSubject = subjectRepository.save(subject);
    
    return mapper.toDto(savedSubject);
}

    @Override
    public List<SubjectDTO> getRootSubjects(Integer surveyEditionId) {
        validateSurveyEdition(surveyEditionId);
        return subjectRepository.findByParentIsNullAndSurveyEditionId(surveyEditionId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubjectDTO> getChildSubjects(Integer parentId) {
        validateParentSubject(parentId);
        return subjectRepository.findByParentId(parentId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public SubjectDTO addChildSubject(Integer parentId, SubjectDTO childDTO) {
        validateParentSubject(parentId);
        childDTO.setParentId(parentId);
        return create(childDTO);
    }

    @Override
    public SubjectDTO update(Integer id, SubjectDTO subjectDTO) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", id));

        subject.setTitle(subjectDTO.getTitle());

        if (subjectDTO.getParentId() != null) {
            Subject parent = subjectRepository.findById(subjectDTO.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectDTO.getParentId()));
            subject.setParent(parent);
        } else {
            subject.setParent(null);
        }

        Subject updatedSubject = subjectRepository.save(subject);
        return mapper.toDto(updatedSubject);
    }

    public void deleteSubject(Integer subjectId) {

        if (!subjectRepository.existsById(subjectId)) {
            throw new EntityNotFoundException("Subject not found");
        }

        subjectRepository.deleteById(subjectId);
    }

    @Override
    protected String getEntityName() {
        return "Subject";
    }

    @Override
    protected void setEntityId(Subject entity, Integer id) {
        entity.setId(id);
    }

    private void validateSurveyEdition(Integer surveyEditionId) {
        if (!surveyEditionRepository.existsById(surveyEditionId)) {
            throw new ResourceNotFoundException("SurveyEdition", surveyEditionId);
        }
    }

    private void validateParentSubject(Integer parentId) {
        if (!repository.existsById(parentId)) {
            throw new ResourceNotFoundException("Parent Subject", parentId);
        }
    }
}