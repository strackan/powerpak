# MCP Universe - UI Mockups

High-fidelity, clickable HTML mockups for the MCP Universe platform - "LinkedIn for AI"

## Overview

These mockups demonstrate the vision for MCP Universe: a marketplace where experts can create personalized MCP servers that bring their authentic voice, knowledge, and expertise to AI workflows.

**Demo Ready**: All pages are fully functional HTML/CSS/JavaScript that can be opened directly in a browser. No build process, no backend required.

## What's Included

### Profile Pages (3 Tiers)

Located in `profile-pages/`

1. **Basic Tier** (`basic.html`) - FREE
   - Simple profile with bio and expertise areas
   - Single "Install MCP" button
   - Basic tier badge
   - Minimal but professional design

2. **Enhanced Tier** (`enhanced.html`) - $49/mo or $499 one-time
   - Professional profile with personality showcase
   - Voice samples showing authentic communication style
   - 5 custom MCP tools with code examples
   - Personality blend visualization
   - Testimonials and social proof
   - Pricing options
   - Upsell to Premium

3. **Premium Tier** (`premium.html`) - $25,000 one-time
   - Full showcase page with video placeholder
   - Complete voice extraction across multiple contexts
   - 12+ custom tools (unlimited in reality)
   - Private templates and frameworks display
   - White-glove onboarding process visualization
   - Calendar booking integration mockup
   - Premium badge and exclusive styling
   - Client testimonials and results

### Marketplace Interface

Located in `marketplace-ui/`

1. **Marketplace Index** (`index.html`)
   - Hero section with platform statistics
   - Smart filtering by category and tier
   - Sort by popularity, newest, or alphabetical
   - Search functionality
   - 15 diverse expert profile cards
   - Clickable navigation to profile pages
   - Quick install actions

2. **Onboarding Flow** (`onboarding.html`)
   - 4-step wizard with progress tracking
   - Step 1: Choose tier (Basic, Enhanced, Premium)
   - Step 2: Configure credentials and settings
   - Step 3: Test installation with success checks
   - Step 4: First prompt suggestions
   - Clean, guided experience

3. **Network Graph** (`network.html`)
   - Visual network showing expert connections
   - Interactive node graph (click to view profiles)
   - Connection strength indicators
   - "People who installed X also installed Y" recommendations
   - Network insights and correlation percentages
   - 7 recommended experts based on Justin's profile

## File Structure

```
mockups/
├── profile-pages/
│   ├── basic.html              # Basic tier profile (Justin Strackany)
│   ├── enhanced.html           # Enhanced tier profile (Justin Strackany)
│   ├── premium.html            # Premium tier profile (Justin Strackany)
│   └── assets/
│       ├── styles.css          # Shared profile page styles
│       └── profile.js          # Shared profile interactions
├── marketplace-ui/
│   ├── index.html              # Main marketplace/discovery page
│   ├── network.html            # Connection graph visualization
│   ├── onboarding.html         # Installation wizard
│   └── assets/
│       ├── marketplace.css     # Marketplace styles
│       └── marketplace.js      # Marketplace functionality
└── README.md                   # This file
```

## Design System

### Color Palette

- **Primary Blue**: `#2563eb` - Main actions, links
- **Secondary Purple**: `#7c3aed` - Accents, gradients
- **Accent Amber**: `#f59e0b` - Premium tier, highlights
- **Success Green**: `#10b981` - Success states, checkmarks
- **Background**: `#f9fafb` - Page background
- **Text**: `#111827` - Primary text
- **Muted**: `#6b7280` - Secondary text
- **Border**: `#e5e7eb` - Borders, dividers

### Typography

- System font stack: `-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', sans-serif`
- Code blocks: `'Monaco', 'Consolas', monospace`
- Generous line height (1.6) for readability
- Clear hierarchy with weight and size

### Components

- **Tier Badges**: Visual indicators for Basic (gray), Enhanced (gradient purple-blue), Premium (gradient amber)
- **Profile Cards**: Hover states, avatars, ratings, quick actions
- **Buttons**: Primary, secondary, tier-specific styles
- **Code Blocks**: Dark theme with copy functionality
- **Modals**: Clean overlay dialogs for interactions
- **Forms**: Clear labels, focused states, validation-ready
- **Wizards**: Multi-step flows with progress indicators

## Interactive Features

### Profile Pages

- Navigation between tier examples
- Expandable tool descriptions
- Copy installation command
- Install button (shows demo modal)
- Video placeholder (click to play - shows alert)
- Calendar booking (shows demo modal)
- Cross-linking to marketplace

### Marketplace

- **Search**: Filter profiles by name, title, or tagline
- **Category Filter**: All, Sales, Customer Success, Engineering, Marketing, Leadership, Product
- **Tier Filter**: All, Basic, Enhanced, Premium
- **Sort**: Popular (by rating), Newest, Alphabetical
- **Quick Install**: Shows installation modal
- **View Profile**: Navigate to profile pages
- **Click Cards**: Navigate to detailed profiles

### Onboarding

- 4-step wizard with progress tracking
- Tier selection with visual options
- Form inputs for configuration
- Success state with checkmarks
- Prompt suggestions with copy buttons
- Previous/Next navigation

### Network Graph

- Interactive visual node graph
- Click nodes to view profiles
- Connection strength indicators
- Recommendation cards with correlation percentages
- Browse all experts CTA

## How to Demo

### Quick Start

1. Open `mockups/marketplace-ui/index.html` in any modern browser
2. Browse the marketplace, use filters and search
3. Click any profile card to view the full profile
4. Navigate between Basic, Enhanced, and Premium tiers
5. Click "Install" to see the installation flow
6. Explore the network graph to see connections

### Recommended Demo Flow

**For Investors/Stakeholders:**

1. Start with `marketplace-ui/index.html` - Show the discovery experience
2. Filter by "Sales" to show category filtering
3. Click Justin Strackany's card → Goes to Enhanced tier
4. Navigate to Premium tier to show the full vision
5. Show the onboarding flow (`onboarding.html`)
6. End with network graph (`network.html`) to show network effects

**For Potential Experts:**

1. Start with `profile-pages/basic.html` - Show free tier
2. Navigate to Enhanced tier - Show what they can build
3. Navigate to Premium tier - Show the full possibility
4. Show marketplace to demonstrate discovery
5. Show network graph to demonstrate reach

**For Technical Audience:**

1. Start with any page
2. Open browser DevTools to show clean HTML/CSS
3. Demonstrate responsive design (resize browser)
4. Show JavaScript interactions (search, filters)
5. View page source to show simplicity (no frameworks)

## Talking Points by Tier

### Basic Tier (FREE)

- "Zero barrier to entry - experts can start immediately"
- "Simple profile that still looks professional"
- "Users can discover and try experts for free"
- "Upgrade path built into the experience"

### Enhanced Tier ($49/mo or $499 lifetime)

- "This is where the magic happens - authentic voice extraction"
- "Custom tools that actually work like the expert thinks"
- "Personality blend shows this isn't generic AI"
- "Testimonials prove social proof and value"
- "Monthly subscription or lifetime purchase options"

### Premium Tier ($25,000)

- "White-glove service for high-value experts"
- "Unlimited customization - tools built for specific needs"
- "Video, calendar integration, private templates"
- "Personal onboarding ensures success"
- "Client results show ROI justifies investment"

## Technical Details

### Technologies Used

- **HTML5**: Semantic, accessible markup
- **CSS3**: Flexbox, Grid, gradients, transitions
- **Vanilla JavaScript**: No frameworks or dependencies
- **No Build Process**: Open HTML files directly
- **No Backend**: All data is hardcoded for demo purposes

### Browser Compatibility

Tested and working in:
- Chrome/Edge (Chromium)
- Firefox
- Safari

### Responsive Design

- Desktop-first approach
- Responsive breakpoints at 768px
- Mobile-friendly navigation
- Flexible grids and layouts

### Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Focus states on interactive elements
- ARIA-friendly (can be enhanced)
- Keyboard navigable

## Customization Guide

### Adding New Profiles

1. Copy an existing profile card in `marketplace-ui/index.html`
2. Update:
   - `data-category` (sales, customer-success, engineering, etc.)
   - `data-tier` (basic, enhanced, premium)
   - `data-rating` (1.0-5.0)
   - `data-profile-url` (link to profile page)
   - Profile name, title, tagline
   - Avatar initials or image

### Creating New Profile Pages

1. Copy one of the tier templates from `profile-pages/`
2. Update profile header (name, title, bio)
3. Customize sections (voice samples, tools, testimonials)
4. Update tier badge and pricing
5. Link from marketplace cards

### Changing Colors

Edit CSS variables in `profile-pages/assets/styles.css` and `marketplace-ui/assets/marketplace.css`:

```css
:root {
  --primary: #2563eb;      /* Main brand color */
  --secondary: #7c3aed;    /* Accent color */
  --accent: #f59e0b;       /* Premium highlights */
  /* ... etc ... */
}
```

## Future Enhancements

Ideas for when building the real platform:

### Profile Pages

- [ ] Real video embedding (YouTube, Vimeo, Loom)
- [ ] Actual calendar integration (Calendly, Cal.com)
- [ ] Live MCP tool playground/tester
- [ ] User reviews and ratings system
- [ ] Follow/bookmark functionality

### Marketplace

- [ ] Advanced search with fuzzy matching
- [ ] Saved searches and alerts
- [ ] Collections/lists of experts
- [ ] Comparison view (side-by-side profiles)
- [ ] Price range filters

### Network Graph

- [ ] Interactive D3.js or similar visualization
- [ ] Drag-and-drop nodes
- [ ] Filter by connection type
- [ ] Expand/collapse network views
- [ ] Export network data

### Onboarding

- [ ] Real MCP server installation
- [ ] API key generation and management
- [ ] Testing with actual AI assistants
- [ ] Integration guides for Claude, ChatGPT, etc.
- [ ] Troubleshooting and diagnostics

## December 4 Demo Checklist

- [x] Profile pages (Basic, Enhanced, Premium)
- [x] Marketplace interface with filtering
- [x] Search functionality
- [x] Onboarding wizard
- [x] Network graph visualization
- [x] Responsive design
- [x] All pages interlinked
- [x] Professional visual design
- [x] Interactive elements working
- [x] Demo documentation

## Support

For questions or modifications, contact the development team or refer to:

- Design system defined in CSS files
- Component documentation in this README
- Inline code comments for complex interactions

## License

These mockups are proprietary to the MCP Universe project.

---

**Built with care for the December 4 demo. Let's show them the future of AI.**
