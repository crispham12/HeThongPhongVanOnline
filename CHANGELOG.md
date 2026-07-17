# Changelog

## [Unreleased]

## [Phase-A] - 2026-07-15
### Removed
- Credit/Wallet system: CreditPackage, CreditWallet, CreditPaymentTransaction, CreditHistory
- Payment system: SubscriptionPlan, UserSubscription, PaymentTransaction  
- SePay webhook integration
- Field DailyGithubAnalysisUsed khỏi User entity
- Migration drop tương ứng: RemoveOutOfScopePhaseA

### Note
- CV Builder module chưa được xóa trong phase này, thực hiện ở Phase B

## [Phase-B] - 2026-07-15
### Removed
- CV Builder module: UserCV, CvTemplate, CvTemplateContainer, CvSectionDefinition,
  CvTemplateSection, CvComponentDefinition, CvTemplateComponent
- Toàn bộ Controllers, Services, Repositories, Interfaces, DTOs liên quan đến CV Builder
- Migration drop tương ứng: RemoveOutOfScopePhaseB
