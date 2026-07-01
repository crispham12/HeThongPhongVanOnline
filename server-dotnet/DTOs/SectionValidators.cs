using FluentValidation;

namespace InterviewPro.API.DTOs
{
    public class AddSectionRequestDtoValidator : AbstractValidator<AddSectionRequestDto>
    {
        public AddSectionRequestDtoValidator()
        {
            RuleFor(x => x.SectionType).NotEmpty().WithMessage("SectionType is required.");
        }
    }

    public class UpdateSectionRequestDtoValidator : AbstractValidator<UpdateSectionRequestDto>
    {
        public UpdateSectionRequestDtoValidator()
        {
            RuleFor(x => x.DisplayName).NotEmpty().When(x => x.DisplayName != null).WithMessage("DisplayName cannot be empty if provided.");
        }
    }

    public class ReorderSectionDtoValidator : AbstractValidator<ReorderSectionDto>
    {
        public ReorderSectionDtoValidator()
        {
            RuleFor(x => x.Sections).NotEmpty().WithMessage("Sections list cannot be empty.");
            RuleForEach(x => x.Sections).SetValidator(new SectionOrderDtoValidator());
        }
    }

    public class SectionOrderDtoValidator : AbstractValidator<SectionOrderDto>
    {
        public SectionOrderDtoValidator()
        {
            RuleFor(x => x.SectionId).NotEmpty().WithMessage("SectionId is required.");
            RuleFor(x => x.OrderIndex).GreaterThan(0).WithMessage("OrderIndex must be greater than 0.");
        }
    }
}
