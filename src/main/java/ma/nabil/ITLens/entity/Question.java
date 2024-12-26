package ma.nabil.ITLens.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Question text is mandatory")
    @Size(min = 10, max = 500, message = "Question text must be between 10 and 500 characters")
    private String text;

    @NotNull(message = "Question type is mandatory")
    @Enumerated(EnumType.STRING)
    private QuestionType type;

    @Min(value = 0, message = "Answer count cannot be negative")
    private Integer answerCount = 0;

    @ManyToOne(optional = false)
    @NotNull(message = "Subject is mandatory")
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Answer> answers = new ArrayList<>();
}