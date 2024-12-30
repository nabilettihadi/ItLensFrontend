package ma.nabil.ITLens.repository;

import ma.nabil.ITLens.entity.Survey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Integer> {
    @Query("SELECT DISTINCT s FROM Survey s " +
           "LEFT JOIN FETCH s.owner " +
           "LEFT JOIN FETCH s.editions e " +
           "WHERE s.owner.id = :ownerId")
    Page<Survey> findByOwnerId(Integer ownerId, Pageable pageable);

    @Query("SELECT DISTINCT s FROM Survey s " +
           "LEFT JOIN FETCH s.owner " +
           "LEFT JOIN FETCH s.editions")
    Page<Survey> findAllWithEditions(Pageable pageable);
}