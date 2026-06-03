using System;
using System.Collections.Generic;

namespace InterviewPro.API.DTOs
{
    public record CvTemplateCreateDto(
        string Name,
        string Description,
        int Width,
        int Height,
        string BackgroundColor
    );

    public record CvTemplateUpdateDto(
        string Name,
        string Description,
        int Width,
        int Height,
        string BackgroundColor,
        string ThumbnailUrl,
        bool IsPublished
    );

    public record CvTemplateResponseDto(
        Guid Id,
        string Name,
        string Description,
        int Width,
        int Height,
        string BackgroundColor,
        string ThumbnailUrl,
        bool IsPublished,
        IEnumerable<CvTemplateComponentResponseDto> Components,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );

    public record CvTemplateComponentCreateDto(
        Guid TemplateId,
        string Type,
        string Content,
        int X,
        int Y,
        int Width,
        int Height,
        int Rotation,
        int ZIndex,
        string StyleJson
    );

    public record CvTemplateComponentUpdateDto(
        string Content,
        int X,
        int Y,
        int Width,
        int Height,
        int Rotation,
        int ZIndex,
        string StyleJson
    );

    public record CvTemplateComponentResponseDto(
        Guid Id,
        Guid TemplateId,
        string Type,
        string Content,
        int X,
        int Y,
        int Width,
        int Height,
        int Rotation,
        int ZIndex,
        object StyleJson, // Let's use dynamic/object so that System.Text.Json can serialize it directly as actual JSON object rather than a double-encoded string
        DateTime CreatedAt,
        DateTime UpdatedAt
    );

    public record ComponentReorderItem(
        Guid ComponentId,
        int ZIndex
    );

    public record ComponentReorderDto(
        List<ComponentReorderItem> Reorders
    );
}
