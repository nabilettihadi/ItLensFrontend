package ma.nabil.ITLens.repository;

import ma.nabil.ITLens.entity.SurveyEdition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyEditionRepository extends JpaRepository<SurveyEdition, Integer> {
    List<SurveyEdition> findBySurveyId(Integer surveyId);

    List<SurveyEdition> findBySurveyIdAndYear(Integer surveyId, Integer year);
}