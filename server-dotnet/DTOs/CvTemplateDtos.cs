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
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}
