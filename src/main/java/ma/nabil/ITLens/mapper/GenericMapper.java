package ma.nabil.ITLens.mapper;

public interface GenericMapper<E, D> {
    D toDto(E entity);

    E toEntity(D dto);
}