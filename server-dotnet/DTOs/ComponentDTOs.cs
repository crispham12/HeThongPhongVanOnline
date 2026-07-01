using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InterviewPro.API.DTOs
{
    public record ComponentDefinitionDto(
        Guid Id,
        string ComponentType,
        string Name,
        string Description,
        string Category,
        string DefaultBindingPath,
        string DefaultVariant,
        object SupportedVariantsJson,
        object CompatibleSectionTypesJson,
        bool IsRepeatable,
        bool IsBindable,
        bool IsContainer,
        bool IsSingleInstance,
        int SortOrder,
        bool IsActive
    );

    public record ComponentLibraryCategoryDto(
        string Name,
        List<ComponentDefinitionDto> Items
    );

    public record ComponentLibraryResponseDto(
        object SelectedSection,
        List<ComponentLibraryCategoryDto> Categories,
        List<ComponentDefinitionDto> Favorites,
        List<ComponentDefinitionDto> RecentlyUsed
    );

    public record ComponentDto(
        Guid Id,
        Guid TemplateId,
        Guid SectionId,
        Guid? ParentComponentId,
        Guid ComponentDefinitionId,
        string DisplayName,
        string ComponentType,
        string Variant,
        string BindingPath,
        int OrderIndex,
        object PropertiesJson,
        bool IsHidden,
        bool IsLocked,
        bool IsDeleted,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );

    public record AddComponentRequestDto(
        [Required] string ComponentType,
        string Variant,
        Guid? ParentComponentId
    );

    public record UpdateComponentRequestDto(
        string DisplayName,
        string Variant,
        string BindingPath,
        string PropertiesJson,
        bool? IsHidden,
        bool? IsLocked,
        Guid? ParentComponentId
    );

    public record ReorderComponentItemDto(
        Guid ComponentId,
        Guid SectionId,
        Guid? ParentComponentId,
        int OrderIndex
    );

}
