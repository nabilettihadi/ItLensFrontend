package ma.nabil.ITLens.repository;

import ma.nabil.ITLens.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    List<Subject> findByParentIsNullAndSurveyEditionId(Integer surveyEditionId);

    List<Subject> findByParentId(Integer parentId);

    void deleteByParentId(Integer parentId);
}