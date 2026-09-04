# Структура проекта

```
salary-app
├── app
│   ├── hire-date
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── login
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── money
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── next-shift
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── onboarding
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── profile
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── schedule
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── splash
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── statistics
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.module.css
│   └── page.tsx
├── components
│   ├── BackButton
│   │   ├── BackButton.module.css
│   │   └── BackButton.tsx
│   ├── BottomSheet
│   │   ├── BottomSheet.module.css
│   │   └── BottomSheet.tsx
│   ├── Button
│   │   ├── Button.module.css
│   │   └── Button.tsx
│   ├── Card
│   │   ├── Card.module.css
│   │   └── Card.tsx
│   ├── common
│   │   ├── AppHydration
│   │   │   └── AppHydration.tsx
│   │   ├── AuthGuard
│   │   │   └── AuthGuard.tsx
│   │   ├── ChangeScheduleSheet
│   │   │   ├── ChangeScheduleSheet.module.css
│   │   │   └── ChangeScheduleSheet.tsx
│   │   ├── InfoRow
│   │   │   ├── InfoRow.module.css
│   │   │   └── InfoRow.tsx
│   │   ├── NextShiftSelector
│   │   │   └── NextShiftSelector.tsx
│   │   ├── ShiftEditorProvider
│   │   │   └── ShiftEditorProvider.tsx
│   │   └── ShiftEditorSheet
│   │       ├── ShiftEditorSheet.module.css
│   │       └── ShiftEditorSheet.tsx
│   ├── DatePicker
│   │   ├── Calendar.tsx
│   │   ├── DatePicker.module.css
│   │   └── DatePicker.tsx
│   ├── home
│   │   ├── actions
│   │   │   ├── ActionCard.module.css
│   │   │   ├── ActionCard.tsx
│   │   │   ├── ActionsSection.module.css
│   │   │   └── ActionsSection.tsx
│   │   ├── motivation
│   │   │   ├── MotivationSheet
│   │   │   │   ├── MotivationSheet.module.css
│   │   │   │   └── MotivationSheet.tsx
│   │   │   ├── MotivationCard.module.css
│   │   │   ├── MotivationCard.tsx
│   │   │   ├── MotivationSection.module.css
│   │   │   └── MotivationSection.tsx
│   │   ├── week
│   │   │   ├── TodayCard.module.css
│   │   │   ├── TodayCard.tsx
│   │   │   ├── WeekDay.module.css
│   │   │   ├── WeekDay.tsx
│   │   │   ├── WeekSection.module.css
│   │   │   └── WeekSection.tsx
│   │   ├── SalaryCard.module.css
│   │   ├── SalaryCard.tsx
│   │   ├── TopStats.module.css
│   │   └── TopStats.tsx
│   ├── Input
│   │   ├── Input.module.css
│   │   └── Input.tsx
│   ├── Loader
│   │   ├── Loader.module.css
│   │   └── Loader.tsx
│   ├── Logo
│   │   ├── Logo.module.css
│   │   └── Logo.tsx
│   ├── money
│   │   ├── CurrentSalary
│   │   │   ├── CurrentSalary.module.css
│   │   │   └── CurrentSalary.tsx
│   │   ├── DailyEarnings
│   │   │   ├── DailyEarnings.module.css
│   │   │   └── DailyEarnings.tsx
│   │   ├── DeductionEditor
│   │   │   ├── DeductionEditor.module.css
│   │   │   └── DeductionEditor.tsx
│   │   ├── Deductions
│   │   │   ├── Deductions.module.css
│   │   │   └── Deductions.tsx
│   │   ├── PaymentEditor
│   │   │   ├── PaymentEditor.module.css
│   │   │   └── PaymentEditor.tsx
│   │   ├── Payments
│   │   │   ├── Payments.module.css
│   │   │   └── Payments.tsx
│   │   └── SalaryBreakdown
│   │       ├── SalaryBreakdown.module.css
│   │       └── SalaryBreakdown.tsx
│   ├── navigation
│   │   ├── BottomNavigation.module.css
│   │   └── BottomNavigation.tsx
│   ├── PageHeader
│   │   ├── PageHeader.module.css
│   │   └── PageHeader.tsx
│   ├── schedule
│   │   ├── MonthCalendar
│   │   │   ├── MonthCalendar.module.css
│   │   │   └── MonthCalendar.tsx
│   │   ├── MonthSummary
│   │   │   ├── MonthSummary.module.css
│   │   │   └── MonthSummary.tsx
│   │   ├── PeriodActions
│   │   │   ├── PeriodActions.module.css
│   │   │   └── PeriodActions.tsx
│   │   └── PeriodModal
│   │       ├── PeriodModal.module.css
│   │       └── PeriodModal.tsx
│   ├── Select
│   │   ├── Select.module.css
│   │   └── Select.tsx
│   └── statistics
│       ├── AverageStats
│       │   ├── AverageStats.module.css
│       │   └── AverageStats.tsx
│       ├── DailyStatistics
│       │   ├── DailyStatistics.module.css
│       │   └── DailyStatistics.tsx
│       ├── DayDetails
│       │   └── DayDetails.tsx
│       ├── DayDetailsModal
│       │   ├── DayDetailsModal.module.css
│       │   └── DayDetailsModal.tsx
│       ├── MentorStats
│       │   ├── MentorStats.module.css
│       │   └── MentorStats.tsx
│       ├── MonthPicker
│       │   ├── MonthPicker.module.css
│       │   └── MonthPicker.tsx
│       ├── MonthSummary
│       │   ├── MonthSummary.module.css
│       │   └── MonthSummary.tsx
│       ├── PeriodPicker
│       │   ├── PeriodPicker.module.css
│       │   └── PeriodPicker.tsx
│       ├── ProductionDetailsModal
│       │   ├── ProductionDetailsModal.module.css
│       │   └── ProductionDetailsModal.tsx
│       └── WorkHours
│           ├── WorkHours.module.css
│           └── WorkHours.tsx
├── data
│   └── shifts.ts
├── docs
│   ├── motivation.md
│   ├── project-structure.md
│   └── roadmap.md
├── lib
│   ├── applyScheduleChanges.ts
│   ├── buildSegment.ts
│   ├── dateUtils.ts
│   ├── detectShiftPosition.ts
│   ├── experience.ts
│   ├── generateSchedule.ts
│   ├── getMonthProductionStats.ts
│   ├── getOriginalMainShiftsForMonth.ts
│   ├── getPattern.ts
│   ├── getPaymentNotifications.ts
│   ├── getScheduleNotification.ts
│   ├── getShiftNotifications.ts
│   ├── profile.ts
│   ├── storage.ts
│   ├── theme.ts
│   └── validateShifts.ts
├── public
│   ├── images
│   │   ├── icons
│   │   │   ├── average-pick.png
│   │   │   ├── boxes.png
│   │   │   ├── calendar.png
│   │   │   ├── day.png
│   │   │   ├── errors.png
│   │   │   ├── grayday.png
│   │   │   ├── graynight.png
│   │   │   ├── history-black.png
│   │   │   ├── home-black.png
│   │   │   ├── money-black.png
│   │   │   ├── night.png
│   │   │   ├── notifications.png
│   │   │   ├── profile-black.png
│   │   │   ├── salary.png
│   │   │   ├── schedule-black.png
│   │   │   └── statistics-black.png
│   │   ├── logo-full-app.png
│   │   ├── logo-full.png
│   │   ├── logo-icon-app.png
│   │   ├── logo-icon.png
│   │   └── logo.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts
│   └── generate-structure.js
├── store
│   ├── financeStore.ts
│   ├── notificationStore.ts
│   ├── scheduleStore.ts
│   └── usersStore.ts
├── types
│   ├── schedule.ts
│   └── user.ts
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── COPYRIGHT.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json

```
