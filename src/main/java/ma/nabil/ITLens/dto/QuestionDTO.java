package ma.nabil.ITLens.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ma.nabil.ITLens.entity.QuestionType;
import ma.nabil.ITLens.entity.Subject;
import ma.nabil.ITLens.validation.annotation.Exists;

import java.util.ArrayList;
import java.util.List;

@Data
public class QuestionDTO {
    private Integer id;

    @NotBlank(message = "Question text is mandatory")
    @Size(min = 10, max = 500, message = "Question text must be between 10 and 500 characters")
    private String text;

    @NotNull(message = "Question type is mandatory")
    private QuestionType type;

    @Min(value = 0, message = "Answer count cannot be negative")
    private Integer answerCount;

    @NotNull(message = "Subject ID is mandatory")
    @Exists(entity = Subject.class, message = "Le sujet spécifié n'existe pas")
    private Integer subjectId;

    @Valid
    private List<AnswerDTO> answers = new ArrayList<>();
}