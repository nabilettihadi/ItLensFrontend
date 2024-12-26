package ma.nabil.ITLens.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.nabil.ITLens.dto.OwnerDTO;
import ma.nabil.ITLens.dto.SurveyDTO;
import ma.nabil.ITLens.service.OwnerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
public class OwnerController {
    private final OwnerService ownerService;

    @GetMapping
    public ResponseEntity<Page<OwnerDTO>> getAllOwners(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ownerService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OwnerDTO> getOwner(@PathVariable Integer id) {
        return ResponseEntity.ok(ownerService.getById(id));
    }

    @GetMapping("/{id}/surveys")
    public ResponseEntity<Page<SurveyDTO>> getOwnerSurveys(@PathVariable Integer id, Pageable pageable) {
        return ResponseEntity.ok(ownerService.getOwnerSurveys(id, pageable));
    }

    @PostMapping
    public ResponseEntity<OwnerDTO> createOwner(@Valid @RequestBody OwnerDTO ownerDTO) {
        return new ResponseEntity<>(ownerService.create(ownerDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OwnerDTO> updateOwner(@PathVariable Integer id, @Valid @RequestBody OwnerDTO ownerDTO) {
        return ResponseEntity.ok(ownerService.update(id, ownerDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOwner(@PathVariable Integer id) {
        ownerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}