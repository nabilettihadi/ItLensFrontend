package ma.nabil.ITLens.mapper;

import ma.nabil.ITLens.dto.OwnerDTO;
import ma.nabil.ITLens.entity.Owner;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OwnerMapper extends GenericMapper<Owner, OwnerDTO> {
    @Override
    @Mapping(target = "surveys", ignore = true)
    OwnerDTO toDto(Owner owner);

    @Override
    @Mapping(target = "surveys", ignore = true)
    Owner toEntity(OwnerDTO dto);
}