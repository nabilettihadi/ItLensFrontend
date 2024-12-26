package ma.nabil.ITLens.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ma.nabil.ITLens.entity.SurveyEdition;
import ma.nabil.ITLens.validation.annotation.Exists;

import java.util.List;

@Data
public class SubjectDTO {
    private Integer id;

    @NotBlank(message = "Title is mandatory")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    private Integer parentId;

    @NotNull(message = "Survey Edition ID is mandatory")
    @Positive(message = "Survey Edition ID must be positive")
    @Exists(entity = SurveyEdition.class, message = "L'édition du sondage spécifiée n'existe pas")
    private Integer surveyEditionId;

    @Valid
    private List<SubjectDTO> children;

    @Valid
    private List<QuestionDTO> questions;
}