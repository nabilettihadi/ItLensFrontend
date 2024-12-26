package ma.nabil.ITLens.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.nabil.ITLens.dto.SubjectDTO;
import ma.nabil.ITLens.service.SubjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {
    private final SubjectService subjectService;

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubject(@PathVariable Integer id) {
        return ResponseEntity.ok(subjectService.getById(id));
    }

    @GetMapping("/survey-edition/{surveyEditionId}/root")
    public ResponseEntity<List<SubjectDTO>> getRootSubjects(@PathVariable Integer surveyEditionId) {
        return ResponseEntity.ok(subjectService.getRootSubjects(surveyEditionId));
    }

    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<SubjectDTO>> getChildSubjects(@PathVariable Integer parentId) {
        return ResponseEntity.ok(subjectService.getChildSubjects(parentId));
    }

    @PostMapping
    public ResponseEntity<SubjectDTO> createSubject(@Valid @RequestBody SubjectDTO subjectDTO) {
        return new ResponseEntity<>(subjectService.create(subjectDTO), HttpStatus.CREATED);
    }

    @PostMapping("/{parentId}/children")
    public ResponseEntity<SubjectDTO> addChildSubject(
            @PathVariable Integer parentId,
            @Valid @RequestBody SubjectDTO childDTO) {
        return new ResponseEntity<>(subjectService.addChildSubject(parentId, childDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectDTO> updateSubject(@PathVariable Integer id, @Valid @RequestBody SubjectDTO subjectDTO) {
        return ResponseEntity.ok(subjectService.update(id, subjectDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Integer id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}