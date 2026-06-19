# Find Ur Room UI/UX Redesign — Antigravity Implementation Prompt

## PROJECT OVERVIEW
**Codebase:** Find Ur Room PWA (Next.js 14, TypeScript, Tailwind CSS, Leaflet, Graphology)  
**Goal:** Implement modern, minimalist UI/UX redesign with cohesive design system  
**Current State:** Functional PWA at https://find-ur-room.vercel.app/ — working routing, offline mode, QR scanning  
**Target State:** Same functionality, new visual design + improved UX flows  
**Scope:** UI/UX only — preserve all logic, data, routing, Leaflet core, service worker

---

## HARD SCOPE BOUNDARIES — MUST ENFORCE

### ✅ CAN MODIFY
- `src/app/globals.css` — styling, animations
- `tailwind.config.ts` — design system config
- `src/components/ui/` — reusable UI components (create new)
- `src/components/screens/` — screen components (create new)
- `src/hooks/` — state management hooks (create new)
- `src/app/page.tsx` — page layout (refactor only, preserve logic)
- `src/components/IndoorMap.tsx` — update marker/polyline styling ONLY
- `src/components/QrScanner.tsx` — update UI styling ONLY
- React component JSX, TypeScript types, CSS classes

### ❌ CANNOT MODIFY
- `src/data/building-graph.json` — graph data structure untouchable
- `public/denah.png` — denah image no resize/compression
- Dijkstra routing algorithm (inside graph traversal logic)
- Leaflet map core initialization (L.map, CRS.Simple, bounds, image overlay)
- Service worker offline logic
- URL parameter parsing (`?start=node_id`)
- Package dependencies (unless explicitly approved)

**If you encounter code that requires changes outside boundaries, STOP and ask for approval before proceeding.**

---

## OUTCOME STATEMENT

**After implementation, the PWA must:**

1. ✅ **Visual Refresh** — Modern minimalist aesthetic applied across all screens
   - Color system: Primary #7C3AED, Secondary #0D0B14, Success #10B981, Error #EF4444, Warning #F59E0B
   - Typography: Inter font, clear hierarchy (H1 28px, H2 20px, Body 14px)
   - Spacing: Consistent 8px-unit system, generous whitespace
   - Shadows: Subtle (0 1px 2px), medium (0 4px 6px), large (0 10px 15px)

2. ✅ **Complete Screen Coverage** — All 8 screens designed & functional
   - Landing (welcome, hero, dual CTA)
   - Manual Position Selection (search + dropdown)
   - Destination Search (current position + destination input)
   - Route Loading (spinner overlay)
   - Route Map Display (Leaflet map + polyline + info card)
   - Success (checkmark animation + next actions)
   - Error States (3 variants: node not found, no route, offline)
   - Empty State (initial welcome)

3. ✅ **Responsive Layouts** — Mobile (390px) & Tablet (768px+) fully functional
   - Mobile: Vertical stacking, 16px padding, full-width components
   - Tablet: 32px padding, max-width 700px, proper proportions
   - All touch targets ≥ 44px (accessibility)
   - No layout shifts or broken styling

4. ✅ **Smooth Interactions** — Micro-animations implemented
   - Button press (100ms scale effect)
   - Dropdown open (150ms slide + bounce)
   - Success celebration (300ms checkmark bounce)
   - Loading spinner (continuous pulse)
   - Error slide-in (200ms from top)

5. ✅ **Preserved Functionality** — All existing features work flawlessly
   - QR scanning still functional (URL param parsing unchanged)
   - Route calculation < 100ms (Dijkstra untouched)
   - Map renders with denah image, markers, polyline
   - Offline mode works (service worker untouched)
   - No console errors, no network failures

6. ✅ **Production Ready** — Code quality, accessibility, testing passed
   - TypeScript strict mode, no any types
   - Tailwind CSS fully utilized, no inline styles
   - Semantic HTML, WCAG AA contrast (≥4.5:1)
   - All screens tested on real device (mobile 390px, tablet 768px)
   - Deployed to Vercel preview, verified live

---

## IMPLEMENTATION STRATEGY

### Phase 1: Design System Foundation (Autonomous, 1-2 hours)
**Task:** Set up Tailwind config + global CSS with complete design system

**Outcome:** 
- `tailwind.config.ts` extended with colors, typography, spacing, shadows, animations, borders
- `src/app/globals.css` imports Inter font, defines base styles, animation keyframes
- `src/lib/constants.ts` exports color palette, spacing scale, animation timings
- All design tokens usable in components via Tailwind classes

**What to do:**
1. Read current `tailwind.config.ts` — understand existing config
2. Read current `src/app/globals.css` — understand current base styles
3. Extend tailwind with custom colors, fontSize, animation, keyframes, borderRadius
4. Update globals.css: import Inter (next/font recommended for PWA offline support)
5. Define all animations: buttonPress, dropdownSlide, successBounce, spinnerPulse, errorSlide, fadeIn
6. Test: `npm run dev`, verify no build errors, check DevTools Computed Styles

**Approval gate:** Ask before proceeding if any existing Tailwind extensions conflict

---

### Phase 2: Core UI Component Library (Autonomous, 2-3 hours)
**Task:** Build reusable component library in `src/components/ui/`

**Outcome:**
- Button (4 variants: primary, secondary, link, icon + all states: default, hover, active, disabled, loading)
- Input (text input with focus, error, icon support, 40px height)
- Card (base card + Position/Route/Error variants, shadow options)
- Badge (pill-shaped for room type, floor, errors)
- Dropdown (searchable select, smooth open/close, selected highlight)
- Spinner (3-circle pulse loader, 40px, purple)
- Alert (error/warning/success variants, dismissible)
- Toast (offline banner sticky top, success toast bottom)
- Header (sticky 56px, UAJY logo left, title center)
- icons.tsx (Lucide React icon wrappers: MapPin, Check, AlertTriangle, WifiOff, etc.)
- ui/index.ts (barrel export all components)

**What to do:**
1. Create directory `src/components/ui/`
2. Build each component as standalone TSX file with TypeScript interfaces
3. Import Tailwind classes from config (colors, animations, shadows, fonts)
4. Export each component + export barrel index
5. Test: Create test file or use Storybook snippet (optional but recommended)
6. Verify: All components render, props work, states visible (disabled, loading, error)

**Component specs reference:** See complete_implementation_prompt.md PART 4

**Approval gate:** Ask before adding any external UI libraries (shadcn/ui, Headless UI, etc.) — stick to Tailwind + custom

---

### Phase 3: State Management Hook (Autonomous, 1-2 hours)
**Task:** Create `useNavigation.ts` with complete state machine

**Outcome:**
- `src/hooks/useNavigation.ts` with full state shape, reducer, actions
- State machine enforced: landing → position → destination → loading → map → success
- All actions defined: SET_SCREEN, SET_POSITION, SET_DESTINATION, SET_ROUTE, SET_ERROR, CLEAR_ERROR, SET_OFFLINE, RESET, etc.
- Custom hook returns `{ state, dispatch }` for use in page.tsx

**What to do:**
1. Create `src/hooks/useNavigation.ts`
2. Define TypeScript interfaces for state, actions, reducer function
3. Implement useReducer with all action handlers
4. Define state machine transitions (which screens can transition to which)
5. Implement error handling (error state persists, can be cleared separately)
6. Create NavigationContext + NavigationProvider (optional but recommended for deep component trees)
7. Test: Create simple test to verify state transitions work

**Approval gate:** Ask if you're unsure about state shape or action names

---

### Phase 4: Screen Components (Autonomous, 3-4 hours)
**Task:** Build 8 screen components in `src/components/screens/`

**Outcome:**
- LandingScreen.tsx (hero, dual CTA)
- ManualPositionScreen.tsx (search + dropdown)
- DestinationSearchScreen.tsx (position card + destination + route button)
- RouteLoadingScreen.tsx (spinner overlay)
- RouteMapScreen.tsx (map + markers + polyline + info card + buttons)
- SuccessScreen.tsx (checkmark animation + celebration)
- ErrorScreen.tsx (node not found / no route variants)
- OfflineIndicator.tsx (sticky top banner)

**What to do:**
1. Create each screen as standalone component
2. Use UI components from `src/components/ui/`
3. Connect to useNavigation hook (read state, dispatch actions)
4. Implement responsive layouts (390px mobile, 768px tablet)
5. Apply animations from Tailwind config (animate-button-press, animate-success-bounce, etc.)
6. Test: Manually navigate through all screens, verify state transitions

**Screen specs reference:** See complete_implementation_prompt.md PART 5

**Approval gate:** Ask before adding complex business logic to screens (keep screens simple, logic in hooks)

---

### Phase 5: Map & QR Visual Updates (Autonomous, 2 hours)
**Task:** Update IndoorMap.tsx markers/polyline + QrScanner.tsx UI

**Outcome:**
- IndoorMap.tsx: Custom marker styling (green start, red end circles), purple dashed polyline, hover glow effect
- Leaflet map core untouched, only visual styling updated
- QrScanner.tsx: Camera overlay UI improved, glassmorphism effect, FAB buttons, error feedback
- QR scan logic preserved, only UI redesigned

**What to do:**

**For IndoorMap.tsx:**
1. Find marker creation code, replace with L.divIcon custom HTML (20px circles)
2. Find polyline creation code, update color #7C3AED, dashArray '5, 5', opacity 0.85
3. Add CSS class to polyline for hover glow effect
4. Add to globals.css: `.route-polyline { transition: filter 150ms ease-in-out; } .route-polyline:hover { filter: drop-shadow(0 0 8px rgba(124,58,237,0.4)); }`
5. Test: Verify markers visible on map, polyline renders in correct color, hover effect works

**For QrScanner.tsx:**
1. Find camera overlay JSX
2. Update styling: Add glassmorphism (backdrop-blur, semi-transparent bg)
3. Update reticle: Animated breathing circle (use tailwind animation)
4. Update close/FAB buttons: 48x48px purple circles, floating position
5. Add error UI: Inline alert if QR not detected after 5s
6. Test: Open camera, verify UI looks modern, reticle animates, close button works

**Code templates:** See complete_implementation_prompt.md PART 8

**Approval gate:** Ask before touching Leaflet initialization or QR scan algorithm

---

### Phase 6: App Orchestration (Autonomous, 1 hour)
**Task:** Update `src/app/page.tsx` to orchestrate screens using state

**Outcome:**
- page.tsx is clean router component (render correct screen based on appState)
- Wraps with NavigationProvider (state accessible to all screens)
- No business logic in page.tsx (logic lives in hooks)
- Error/loading states handled globally

**What to do:**
1. Read current page.tsx — understand structure
2. Replace page content with state-based screen router:
   ```typescript
   const { state } = useNavigation()
   
   return (
     <NavigationProvider>
       <Header />
       <OfflineIndicator />
       
       {state.screen === 'landing' && <LandingScreen />}
       {state.screen === 'manual-position' && <ManualPositionScreen />}
       {state.screen === 'destination-search' && <DestinationSearchScreen />}
       {state.screen === 'route-loading' && <RouteLoadingScreen />}
       {state.screen === 'viewing-map' && <RouteMapScreen />}
       {state.screen === 'success' && <SuccessScreen />}
       {state.error.type && <ErrorScreen error={state.error} />}
     </NavigationProvider>
   )
   ```
3. Test: Verify all screens render, transitions work smoothly

**Approval gate:** No approval needed, straightforward orchestration

---

### Phase 7: Testing & Verification (Autonomous, 2-3 hours)
**Task:** Comprehensive testing to verify no regressions + new design works

**Outcomes:**
- All critical paths tested (QR scan → route → success flow)
- Offline mode verified (PWA cache)
- Responsive layouts tested (390px mobile, 768px tablet)
- Accessibility checked (color contrast, touch targets, keyboard nav)
- No console errors, no network issues
- Live preview on Vercel working

**What to do:**

**Manual testing (use browser DevTools):**
1. Landing → "Mulai Navigasi" → Manual position screen loads ✓
2. Manual position → search "Pintu", select, "Lanjut" → Destination screen ✓
3. Destination → search "Lab", select room, "Cari Rute" → Loading spinner ✓
4. Loading → wait < 100ms → Route map displays ✓
5. Route map → see markers (green start, red end), purple polyline ✓
6. Route map → "Sudah Sampai" → Success screen with checkmark animation ✓
7. Success → "Cari Ruangan Lain" → Back to destination search ✓
8. QR scan: Open camera, verify UI, close button works ✓

**Offline mode test:**
1. Open DevTools → Application → Service Workers → Check registered ✓
2. Turn on Airplane mode (or use DevTools offline mode)
3. Reload page → No network errors, app loads from cache ✓
4. Navigate full flow offline → No failures ✓
5. Offline banner shows at top ✓

**Responsive test:**
1. Mobile (390px): Open DevTools, set viewport 390px, test all screens
   - Buttons full-width, readable text, no overflow ✓
   - Touch targets ≥ 44px ✓
2. Tablet (768px): Set viewport 768px, test layouts
   - Max-width 700px respected ✓
   - Proportions correct ✓
3. Rotate: Portrait → Landscape, layout adapts ✓

**Accessibility test:**
1. Color contrast: All text ≥ 4.5:1 (use Chrome DevTools Lighthouse)
2. Touch targets: Buttons 48px/40px, inputs 40px, minimum 44px ✓
3. Keyboard nav: Tab through elements, focus visible ✓
4. Screen reader: Test with NVDA/JAWS (if available) or skip if not critical

**Build & deployment test:**
1. `npm run build` — no errors ✓
2. `npm run dev` — local dev server works ✓
3. Deploy to Vercel preview (auto-deploy on branch push)
4. Test live preview URL — all features work ✓

**What to verify in browser:**
- No red errors in console
- No network failures (check Network tab)
- All animations smooth (60fps, no jank)
- Map renders correctly with denah image
- Route polyline visible and glow effect works on hover
- Markers positioned correctly
- UAJY logo visible on every screen
- Offline banner appears when offline

**If bugs found:**
- Fix immediately (don't ask, you have autonomy for UI/UX bugs)
- Re-test after fix
- If bug is outside your scope (graph, routing, offline logic), ask for approval

---

### Phase 8: Deployment & Finalization (Autonomous, 0.5 hours)
**Task:** Prepare for production deployment

**Outcome:**
- Code committed to feature branch
- PR opened with description
- All tests passing
- Live preview verified on Vercel
- Ready for merge to main

**What to do:**
1. Create feature branch: `git checkout -b feature/ui-redesign`
2. Commit work: `git add . && git commit -m "feat: UI/UX redesign with modern minimalist design system"`
3. Push: `git push origin feature/ui-redesign`
4. Open PR on GitHub (if applicable) or notify team
5. Final verification on live preview URL
6. If approved, merge to main (Vercel auto-deploys)

---

## CRITICAL CONSTRAINTS & GUARDRAILS

### Scope Enforcement
```
EVERY TIME you modify a file, ask yourself:
- Am I modifying UI/UX styling? → ALLOWED
- Am I changing component logic? → ALLOWED (if UI-related)
- Am I modifying graph.json? → STOP, ask for approval
- Am I modifying denah image? → STOP, ask for approval
- Am I changing Dijkstra algorithm? → STOP, ask for approval
- Am I modifying service worker? → STOP, ask for approval
```

### Autonomy Levels
```
AUTONOMOUS (no approval needed):
✅ Create new UI components
✅ Update Tailwind config
✅ Refactor React components for UI
✅ Add animations, styling, spacing
✅ Create screens, hooks
✅ Fix UI/UX bugs discovered during testing
✅ Verify functionality works

ASK FOR APPROVAL BEFORE:
⚠️ Modifying graph traversal logic
⚠️ Changing Leaflet map initialization
⚠️ Touching service worker or offline logic
⚠️ Adding new npm dependencies
⚠️ Refactoring non-UI code (if unclear)
⚠️ Making architectural changes (state management redesign, etc.)
```

### Code Quality Standards
```
TypeScript strict mode — no any types
Tailwind CSS only — no inline styles, no CSS modules (unless existing)
Semantic HTML — proper tags (button, form, nav, etc.)
Accessibility — WCAG AA minimum (contrast, touch targets, keyboard nav)
Performance — no blocking animations, smooth 60fps
Clean code — remove console.log, commented code, unused imports
```

---

## TESTING CHECKLIST (Before Final Approval)

- [ ] All 8 screens render without errors
- [ ] State transitions work (landing → position → destination → map → success)
- [ ] QR scan still functional (URL param parsing works)
- [ ] Route calculation < 100ms (Dijkstra unchanged)
- [ ] Map displays with correct denah image, markers, polyline
- [ ] Markers green (start) and red (end), 20px circles
- [ ] Polyline purple #7C3AED, dashed, 4px weight
- [ ] Hover glow effect works on polyline
- [ ] All animations smooth (button press 100ms, dropdown 150ms, success 300ms)
- [ ] Mobile 390px: All screens, full-width buttons, readable text, touch targets 44px+
- [ ] Tablet 768px: Proper proportions, max-width 700px, no layout breaks
- [ ] Offline mode: Service worker registered, app works without internet
- [ ] Offline banner appears at top when offline
- [ ] UAJY logo visible on all screens
- [ ] No console errors or warnings
- [ ] No network failures (check Network tab DevTools)
- [ ] Keyboard navigation works (Tab through elements, visible focus)
- [ ] Color contrast ≥ 4.5:1 (WCAG AA)
- [ ] Build passes: `npm run build` no errors
- [ ] Local dev works: `npm run dev` launches successfully
- [ ] Vercel preview URL live and fully functional

---

## SUCCESS CRITERIA (Final Outcome)

After completion:
- ✅ Modern minimalist UI/UX fully implemented
- ✅ All 8 screens designed + functional
- ✅ Design system (colors, fonts, spacing) consistent across app
- ✅ Micro-interactions smooth and delightful
- ✅ Responsive layouts work perfectly (390px + 768px)
- ✅ All existing functionality preserved (routing, offline, QR, map)
- ✅ Code quality high (TypeScript strict, clean, accessible)
- ✅ No regressions (all critical paths tested)
- ✅ Ready for production (deployed & verified live)

**Expected outcome: A beautifully redesigned Find Ur Room with zero impact on routing, offline mode, or graph functionality.** 🎉

---

## EXECUTION MODE: START IMMEDIATELY

**Phase 1 (Design System):** Begin now, ~1-2 hours  
**Phase 2 (Components):** Follow immediately, ~2-3 hours  
**Phase 3 (State):** Then state management, ~1-2 hours  
**Phase 4 (Screens):** Build screens, ~3-4 hours  
**Phase 5 (Map/QR):** Update visual styling, ~2 hours  
**Phase 6 (Orchestration):** Final routing, ~1 hour  
**Phase 7 (Testing):** Verify everything, ~2-3 hours  
**Phase 8 (Deployment):** Finalize, ~0.5 hours  

**Total estimated: 15-18 hours of focused autonomous work.**

Start with Phase 1 now. Ask questions only if you hit scope boundaries or need approval for changes.

Good luck! 🚀
