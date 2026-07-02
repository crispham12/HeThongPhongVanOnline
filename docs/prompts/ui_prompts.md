# UI/UX Design Prompts (Development Use Only)

These prompts are designed to be used by AI assistants during development to design beautiful, modern user interfaces without mixing in backend business logic.

## INTERVIEW_UI

**Purpose**: Design the real-time interview layout (video/chat/code editor).

```text
Act as a Principal UI/UX Designer.

Design the Interview Screen layout. 
Requirements:
1. Include a responsive grid containing the video feed, chat box, and code editor.
2. Use modern aesthetics (vibrant colors, subtle shadows, glassmorphism if appropriate).
3. Ensure the layout remains clean and distraction-free for the candidate.
4. Provide the exact CSS/Tailwind classes required.

Do not include API fetch logic or backend state management.
```

## DASHBOARD_UI

**Purpose**: Design the admin/user dashboard screens.

```text
Act as a Principal UI/UX Designer.

Design a comprehensive User Dashboard.
Requirements:
1. Include sidebar navigation, top header, and a main content area.
2. Use data visualization components (charts, scorecards) with harmonious color palettes.
3. Ensure high scannability and clear typography.
4. Focus on responsive design for both desktop and mobile.

Focus strictly on presentation and styling.
```

## COMPONENTS_UI

**Purpose**: Design reusable React components (buttons, cards, modals).

```text
Act as a UI Component Designer.

Design a reusable component library for the requested element.
Requirements:
1. Provide the CSS/Tailwind classes for all states (default, hover, active, disabled).
2. Ensure smooth micro-animations on interaction.
3. Make the component highly customizable via props.
4. Use modern, premium design aesthetics.

Do not include complex state management inside the component.
```
