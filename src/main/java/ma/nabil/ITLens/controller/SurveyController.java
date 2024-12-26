package ma.nabil.ITLens.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.nabil.ITLens.dto.SurveyDTO;
import ma.nabil.ITLens.service.SurveyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {
    private final SurveyService surveyService;

    @GetMapping
    public ResponseEntity<Page<SurveyDTO>> getAllSurveys(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(surveyService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SurveyDTO> getSurvey(@PathVariable Integer id) {
        return ResponseEntity.ok(surveyService.getById(id));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<Page<SurveyDTO>> getSurveysByOwnerId(
            @PathVariable Integer ownerId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(surveyService.getSurveysByOwnerId(ownerId, pageable));
    }

    @PostMapping
    public ResponseEntity<SurveyDTO> createSurvey(@Valid @RequestBody SurveyDTO surveyDTO) {
        return new ResponseEntity<>(surveyService.create(surveyDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SurveyDTO> updateSurvey(@PathVariable Integer id, @Valid @RequestBody SurveyDTO surveyDTO) {
        return ResponseEntity.ok(surveyService.update(id, surveyDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSurvey(@PathVariable Integer id) {
        surveyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}