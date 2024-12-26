package ma.nabil.ITLens.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SurveyResultDTO {
    @NotBlank(message = "Survey title is mandatory")
    private String surveyTitle;

    @NotEmpty(message = "Subjects list cannot be empty")
    @Valid
    private List<SubjectResultDTO> subjects;

    @Data
    public static class SubjectResultDTO {
        @NotBlank(message = "Subject title is mandatory")
        private String title;

        @Valid
        private List<SubjectResultDTO> children;

        @Valid
        private List<QuestionResultDTO> questions;
    }

    @Data
    public static class QuestionResultDTO {
        @NotBlank(message = "Question text is mandatory")
        private String text;

        @NotNull(message = "Answers map cannot be null")
        private Map<@NotBlank String, @PositiveOrZero Integer> answers;

        @PositiveOrZero(message = "Total answers must be positive or zero")
        private Integer totalAnswers;
    }
}