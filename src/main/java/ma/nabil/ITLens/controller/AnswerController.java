package ma.nabil.ITLens.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.nabil.ITLens.dto.AnswerDTO;
import ma.nabil.ITLens.service.AnswerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
public class AnswerController {
    private final AnswerService answerService;

    @GetMapping("/{id}")
    public ResponseEntity<AnswerDTO> getAnswer(@PathVariable Integer id) {
        return ResponseEntity.ok(answerService.getById(id));
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<AnswerDTO>> getAnswersByQuestionId(@PathVariable Integer questionId) {
        return ResponseEntity.ok(answerService.getAnswersByQuestionId(questionId));
    }

    @PostMapping
    public ResponseEntity<AnswerDTO> createAnswer(@Valid @RequestBody AnswerDTO answerDTO) {
        return new ResponseEntity<>(answerService.create(answerDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnswerDTO> updateAnswer(@PathVariable Integer id, @Valid @RequestBody AnswerDTO answerDTO) {
        return ResponseEntity.ok(answerService.update(id, answerDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Integer id) {
        answerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/increment")
    public ResponseEntity<Void> incrementSelectionCount(@PathVariable Integer id) {
        answerService.incrementSelectionCount(id);
        return ResponseEntity.ok().build();
    }
}