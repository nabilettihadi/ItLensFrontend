package ma.nabil.ITLens.repository;

import ma.nabil.ITLens.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Integer> {
    List<Answer> findByQuestionId(Integer questionId);

    @Modifying
    @Query("UPDATE Answer a SET a.selectionCount = a.selectionCount + 1 WHERE a.id = :answerId")
    void incrementSelectionCount(@Param("answerId") Integer answerId);
}