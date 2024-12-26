package ma.nabil.ITLens.repository;

import ma.nabil.ITLens.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findBySubjectId(Integer subjectId);

    @Modifying
    @Query("UPDATE Question q SET q.answerCount = q.answerCount + 1 WHERE q.id = :questionId")
    void incrementAnswerCount(@Param("questionId") Integer questionId);
}