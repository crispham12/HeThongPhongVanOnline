using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    public class SectionDto
    {
        public Guid Id { get; set; }
        public Guid TemplateId { get; set; }
        public Guid SectionDefinitionId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string BindingPath { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsRepeatable { get; set; }
        public bool IsHidden { get; set; }
        public bool IsLocked { get; set; }
        public Guid? ContainerId { get; set; }
        public int ColumnIndex { get; set; }
        public string LayoutConfigJson { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public DateTime? RestoredAt { get; set; }
    }

    public class ContainerDto
    {
        public Guid Id { get; set; }
        public Guid TemplateId { get; set; }
        public string LayoutType { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string ConfigJson { get; set; } = string.Empty;
    }

    public class SectionLibraryItemDto
    {
        public Guid Id { get; set; }
        public string SectionType { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string DefaultBindingPath { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsRequired { get; set; }
        public bool IsRepeatable { get; set; }
        public bool IsSingleInstance { get; set; }
        public bool IsATSFriendly { get; set; }
    }

    public class SectionCategoryDto
    {
        public string Category { get; set; } = string.Empty;
        public List<SectionLibraryItemDto> Items { get; set; } = new List<SectionLibraryItemDto>();
    }

    public class SectionLibraryDto
    {
        public List<SectionCategoryDto> Categories { get; set; } = new List<SectionCategoryDto>();
    }

    public class TemplateProgressDto
    {
        public int SectionsAdded { get; set; }
        public int TotalSections { get; set; }
        public int CoreAdded { get; set; }
        public int CoreTotal { get; set; }
        public int OptionalAdded { get; set; }
        public int OptionalTotal { get; set; }
        public List<string> MissingRequired { get; set; } = new List<string>();
        public bool ATSReady { get; set; }
        public double CompletionPercentage { get; set; }
    }

    public class ValidationIssueDto
    {
        public string Severity { get; set; } = string.Empty; // Critical, Warning, Info
        public string Message { get; set; } = string.Empty;
        public Guid? SectionId { get; set; }
    }

    public class ValidationResultDto
    {
        public bool CanPublish { get; set; }
        public List<ValidationIssueDto> Errors { get; set; } = new List<ValidationIssueDto>();
        public List<ValidationIssueDto> Warnings { get; set; } = new List<ValidationIssueDto>();
    }

    public class AddSectionRequestDto
    {
        public string SectionType { get; set; } = string.Empty;
    }

    public class UpdateSectionRequestDto
    {
        public string? DisplayName { get; set; }
        public string? Description { get; set; }
        public string? BindingPath { get; set; }
        public bool? IsHidden { get; set; }
        public bool? IsLocked { get; set; }
        public Guid? ContainerId { get; set; }
        public int? ColumnIndex { get; set; }
        public string? LayoutConfigJson { get; set; }
    }

    public class UpdateContainerRequestDto
    {
        public string? LayoutType { get; set; }
        public string? ConfigJson { get; set; }
    }

    public class SectionOrderDto
    {
        public Guid SectionId { get; set; }
        public int OrderIndex { get; set; }
    }

    public class ReorderSectionDto
    {
        public List<SectionOrderDto> Sections { get; set; } = new List<SectionOrderDto>();
    }

    public class TemplateSectionsResponseDto
    {
        public TemplateProgressDto Progress { get; set; } = new TemplateProgressDto();
        public SectionLibraryDto Library { get; set; } = new SectionLibraryDto();
        public List<ContainerDto> Containers { get; set; } = new List<ContainerDto>();
        public List<SectionDto> Sections { get; set; } = new List<SectionDto>();
        public ValidationResultDto Validation { get; set; } = new ValidationResultDto();
    }
}
