package ma.nabil.ITLens.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
public class SurveyEdition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "Creation date is mandatory")
    @Temporal(TemporalType.TIMESTAMP)
    private Date creationDate;

    @NotNull(message = "Start date is mandatory")
    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;

    @NotNull(message = "Year is mandatory")
    private Integer year;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull(message = "Survey is mandatory")
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @OneToMany(mappedBy = "surveyEdition", cascade = CascadeType.ALL)
    private List<Subject> subjects = new ArrayList<>();
}