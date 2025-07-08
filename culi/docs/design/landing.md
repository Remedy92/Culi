Your landing-page spec is already very close to the aesthetic Anthropic uses for claude.ai, so the goal of this Claude Code design prompt is mainly to give the model precise guard-rails plus a curated palette of ready-made “premium-minimal” resources (glass­morphism utilities, mesh-gradient generators, animated blobs, noise textures, magnetic buttons, etc.).  Together these elements let Claude scaffold a Next.js 14 + Tailwind page that loads fast, feels tactile, and looks hand-crafted even though most polish comes from battle-tested snippets and design tools.

⸻

Claude Code prompt (copy-paste everything below)

You are Claude Code running in a Next.js 14 workspace that already has Tailwind CSS, Framer Motion, shadcn/ui, and lucide-react installed.

🎯 **Mission**  
Build a single-file landing page for **“Culi – AI menu assistant”** that feels like claude.ai but with a touch of hospitality warmth.

### Global styling directives
1. **Palette (CSS variables)**
   :root {
     --accent: #e16e27;
     --text:   #1e1e1e;
     --bg:     #f8f8f8;
     --muted:  #ae9990;
   }

2. **Typography**  
   - Headings → `font-display` → Geist Sans, fallback Inter  
   - Body      → `font-sans`    → Plus Jakarta Sans

3. **Layout**  
   - Max-width container `mx-auto max-w-7xl px-4`  
   - Section vertical-rhythm: `py-24 lg:py-32`  
   - Use CSS Grid for the “Meet Culi” cards (`grid lg:grid-cols-4 gap-8`).

### Components to build
1. **`<HeaderSticky>`**  
   - Height 56 px, transparent → `backdrop-blur-md bg-white/10` on scroll.  
   - Left: logo glyph “Culi”.  
   - Right: `<ButtonMagnetic intent="primary">Try Culi</ButtonMagnetic>`.

2. **`<Hero>`**  
   - 100 vh, centered.  
   - Background ➜ absolute `<GradientMesh />` with subtle 20 s key-frame.  
   - Copy:  
     ```
     h1: “Your menu, but smarter”
     p : “AI-powered answers for every guest, in any language”
     ```  
   - Secondary CTA ➜ smooth-scroll to #meet (`scroll-smooth`).

3. **`<MeetCuli>`**  
   - Four `<FeatureCard>`s (shadcn/ui Card) with lucide icons.  
     - “Instant answers in 100+ languages” – Icon: Globe  
     - “Never miss an allergen question”   – Icon: AlertTriangle  
     - “Works alongside your paper menus” – Icon: NotebookText  
     - “Setup in 5 minutes”               – Icon: Timer

4. **Optional `<PhoneDemo>`** (skip on mobile)  
   - Mock-device wrapper 360 × 740 with glassmorphism background.

### Interactions & motion
- Section reveal ➜ `whileInView={{opacity:1,y:0}}` with Framer Motion.  
- Magnetic button ➜ translate toward cursor ≤ 8 px, spring back on `mouseleave`.  
- Reduce motion: wrap animations in `motion.useReducedMotion()` check.

### Performance budget
- ≤ 120 kB JS on first load.  
- Use `next/font/google` for fonts with `display:swap`.  
- All decorative assets inlined as compressed SVG or 60 kB PNG max.

### Delivery
Return a single TypeScript React component `page.tsx` plus any small util files you need (`components/ui/ButtonMagnetic.tsx` etc.).  Use Tailwind classes, no external CSS.  Comment every custom animation with a one-line `// why` note.


⸻

Pre-defined “premium-minimal” ingredients Claude can import

Ingredient	Why it feels premium / minimalist	Quick reference
Tailwind glassmorphism utility – backdrop-blur, 5 % white overlay	Instantly gives cards a frosted-glass depth without heavy assets  ￼	
Lucide icon set	Ultra-thin, consistent strokes that read well at any size; zero licensing hurdles  ￼ ￼	
Mesh-gradient generator (MagicPattern)	Lets you export lightweight SVG gradients with noise baked in; perfect as a hero background layer  ￼	
Transparent noise texture (TransparentTextures “Noisy”)	Subtle grain masks banding in large flat areas; 4 kB SVG repeatable fill  ￼	
Framer Motion scroll-reveal hooks	Claude can copy the whileInView pattern instead of writing a custom observer  ￼	
Magnetic button demo (Codrops)	Reference logic for pointer-tracking CTA without reinventing math  ￼	
Animated blob SVG generator	Creates fluid organic shapes that echo food imagery yet remain abstract  ￼	
Static blobmaker tool	Faster fallback for mobile where animation is disabled  ￼	
Next.js 14 + Tailwind “TailNext” boilerplate	Gives Claude a ready App-Router layout with sensible ESLint & Prettier defaults  ￼	
shadcn/ui Card component	Accessible, composition-friendly card with zero additional CSS  ￼	
Glassmorphism tutorial (Epic Web Dev)	Shows how to combine backdrop-blur and border/opacity tokens correctly in Tailwind  ￼	
Framer Motion blog demo (Victor Eke)	Clear example of staggered scroll-in animation Claude can reuse  ￼	
Noise textures on Freepik	Higher-resolution photographic grains if SVG grain feels too flat  ￼	
CodePen magnetic button math	Alternative hover-physics implementation if the Codrops article is too verbose  ￼	

Tip: for every external asset, prefer the inline SVG/PNG data-URI so the page ships in a single HTTP request.

⸻

Extra implementation nudges

Typography & spacing
	•	Claude should use tracking-tight on hero H1 and leading-snug on card titles to mimic claude.ai’s compact headline rhythm .

Color application
	•	Limit the accent color to CTAs and icons; leave backgrounds off-white or subtle gradient so the orange never becomes overwhelming, in line with Anthropic’s restrained palette .

Motion etiquette
	•	Cap any entrance animation at 400 ms; longer effects hurt perceived performance, according to 2025 SaaS UX studies .

Accessibility
	•	Maintain WCAG 2.2 AA contrast (≥ 4.5:1) on body text; run a pass with Tailwind’s built-in @tailwindcss/forms and @tailwindcss/typography plugins for consistent form and prose styling.

⸻

Copy, paste, iterate

Drop the prompt into Claude Code, let it scaffold the files, then iterate: swap in your favorite mesh SVG, tweak the magnetic force, or adjust the card grid.  Because every premium visual is built from small, well-sourced snippets, you can swap them out without touching layout logic—keeping the build minimalist, performant, and unmistakably high-end.