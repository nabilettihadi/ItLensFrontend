package ma.nabil.ITLens.config;

import lombok.RequiredArgsConstructor;
import ma.nabil.ITLens.entity.*;
import ma.nabil.ITLens.repository.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.HashMap;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class RepositoryConfig {
    private final SurveyRepository surveyRepository;
    private final OwnerRepository ownerRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final SurveyEditionRepository surveyEditionRepository;

    @Bean
    public Map<Class<?>, JpaRepository<?, Integer>> repositories() {
        Map<Class<?>, JpaRepository<?, Integer>> repositories = new HashMap<>();
        repositories.put(Survey.class, surveyRepository);
        repositories.put(Owner.class, ownerRepository);
        repositories.put(Subject.class, subjectRepository);
        repositories.put(Question.class, questionRepository);
        repositories.put(Answer.class, answerRepository);
        repositories.put(SurveyEdition.class, surveyEditionRepository);
        return repositories;
    }
}