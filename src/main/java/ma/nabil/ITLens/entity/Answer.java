package ma.nabil.ITLens.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Answer text is mandatory")
    @Size(min = 1, max = 255, message = "Answer text must be between 1 and 255 characters")
    private String text;

    @Min(value = 0, message = "Selection count cannot be negative")
    private Integer selectionCount = 0;

    @DecimalMin(value = "0.0", message = "Percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "Percentage cannot exceed 100")
    private Double percentage = 0.0;

    @ManyToOne(optional = false)
    @NotNull(message = "Question is mandatory")
    @JoinColumn(name = "question_id")
    private Question question;
}