package ma.nabil.ITLens.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import ma.nabil.ITLens.entity.Question;
import ma.nabil.ITLens.validation.annotation.Exists;

@Data
public class AnswerDTO {
    private Integer id;

    @NotBlank(message = "Answer text is mandatory")
    @Size(min = 1, max = 255, message = "Answer text must be between 1 and 255 characters")
    private String text;

    @Min(value = 0, message = "Selection count cannot be negative")
    private Integer selectionCount;

    @DecimalMin(value = "0.0", message = "Percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "Percentage cannot exceed 100")
    private Double percentage;

    @NotNull(message = "Question ID is mandatory")
    @Exists(entity = Question.class, message = "La question spécifiée n'existe pas")
    private Integer questionId;
}