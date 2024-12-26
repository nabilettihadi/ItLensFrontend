package ma.nabil.ITLens.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.nabil.ITLens.dto.SurveyEditionDTO;
import ma.nabil.ITLens.dto.SurveyEditionParticipationDTO;
import ma.nabil.ITLens.service.AnswerService;
import ma.nabil.ITLens.service.QuestionService;
import ma.nabil.ITLens.service.SurveyEditionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/survey-editions")
@RequiredArgsConstructor
public class SurveyEditionController {
    private final SurveyEditionService surveyEditionService;
    private final AnswerService answerService;
    private final QuestionService questionService;

    @GetMapping("/{id}")
    public ResponseEntity<SurveyEditionDTO> getSurveyEdition(@PathVariable Integer id) {
        return ResponseEntity.ok(surveyEditionService.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<SurveyEditionDTO>> getAllSurveyEditions(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(surveyEditionService.getAll(pageable));
    }

    @GetMapping("/survey/{surveyId}")
    public ResponseEntity<List<SurveyEditionDTO>> getSurveyEditionsBySurveyId(
            @PathVariable Integer surveyId) {
        return ResponseEntity.ok(surveyEditionService.getEditionsBySurveyId(surveyId));
    }

    @PostMapping
    public ResponseEntity<SurveyEditionDTO> createSurveyEdition(
            @Valid @RequestBody SurveyEditionDTO surveyEditionDTO) {
        return new ResponseEntity<>(surveyEditionService.create(surveyEditionDTO),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SurveyEditionDTO> updateSurveyEdition(
            @PathVariable Integer id,
            @Valid @RequestBody SurveyEditionDTO surveyEditionDTO) {
        return ResponseEntity.ok(surveyEditionService.update(id, surveyEditionDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSurveyEdition(@PathVariable Integer id) {
        surveyEditionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{surveyEditionId}/participate")
    public ResponseEntity<Void> participate(
            @PathVariable Integer surveyEditionId,
            @Valid @RequestBody SurveyEditionParticipationDTO participationDTO) {

        participationDTO.getResponses().forEach(response -> {
            questionService.incrementAnswerCount(response.getQuestionId());
            response.getAnswerIds().forEach(answerId -> {
                answerService.incrementSelectionCount(answerId);
            });
        });

        return ResponseEntity.ok().build();
    }
}