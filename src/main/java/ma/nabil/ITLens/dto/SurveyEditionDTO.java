package ma.nabil.ITLens.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ma.nabil.ITLens.entity.Survey;
import ma.nabil.ITLens.validation.annotation.Exists;

import java.util.Date;
import java.util.List;

@Data
public class SurveyEditionDTO {
    private Integer id;

    @NotNull(message = "Creation date is mandatory")
    private Date creationDate;

    @NotNull(message = "Start date is mandatory")
    @FutureOrPresent(message = "Start date must be in present or future")
    private Date startDate;

    @NotNull(message = "Year is mandatory")
    private Integer year;

    @NotNull(message = "Survey ID is mandatory")
    @Exists(entity = Survey.class, message = "Le sondage spécifié n'existe pas")
    private Integer surveyId;

    @Valid
    private List<SubjectDTO> subjects;
}