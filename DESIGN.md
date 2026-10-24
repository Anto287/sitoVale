# Existing visual system

## Physical setting
A visitor planning ski lessons reads on a phone in changing mountain light or on a laptop at home. Preserve the existing light and dark system themes; prioritize clear text and controls in both.

## Identity
Personal alpine photography, a warm and patient voice, and the pink and charcoal uniform palette. Keep the existing photographic hero and Bodoni name treatment.

## Typography
Locally hosted Bodoni Moda Variable for display headings; Jost Variable for body text, controls and navigation. Preserve the pairing. Use restrained tracking for functional text and enough line height for multilingual content.

## Color
Existing roles: warm snow background, charcoal ink, blush section backgrounds, fuchsia actions. Light and dark theme tokens are defined in src/styles.css. Refine these using OKLCH without changing their visual roles. Functional text must remain legible against its surface.

## Layout and interaction
Fluid gutter, 1240px content maximum, photographic split layouts, three lesson articles, scrollable reviews, masonry gallery and a dark contact section. Keep the sequence. On mobile, prioritize readable contact details and full-width form controls; navigation must remain usable with keyboard and on short screens.

## Motion and accessibility
Existing GSAP choreography respects reduced motion. Preserve it while keeping focused navigation visible. Form fields retain visible labels and browser validation; communicating required fields must not depend on placeholder text.

Source: current src/styles.css, src/fonts.css and src/components, reviewed during the UI refinement.
