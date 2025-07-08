# TableLink: AI-Powered Menu Assistant for Restaurants - Developer Overview

## What is TableLink?

TableLink is an AI-powered menu assistant that **complements** (not replaces) traditional paper menus in restaurants. It's a web-based application that enables restaurant guests to scan a QR code and instantly ask questions about menu items in any language, receiving accurate answers about dishes, allergens, dietary options, and recommendations.

## The Core Problem

### For Customers
- **Language barriers**: 20%+ of diners struggle with menu language, especially critical in multilingual regions like Belgium
- **Allergen confusion**: 32 million Americans have life-threatening allergies; less than 50% find menu allergen info clear
- **Hygiene concerns**: Physical menus are "100 times dirtier than toilet seats"
- **Accessibility issues**: 16% of global population has disabilities; elderly struggle with small print
- **Information gaps**: Constant questions about ingredients, preparation methods, wine pairings

### For Restaurants
- **High update costs**: Paper menu reprints cost up to €5,000 annually
- **Staff overload**: 57% of consumers doubt busy restaurants take orders correctly
- **Labor shortages**: 70% of restaurants have unfilled positions
- **Missed revenue**: No dynamic upselling or recommendations
- **Zero insights**: No data on customer preferences or popular items

## Technical Architecture

### Domain Structure
```
tablelink.be              # Marketing site, onboarding, account management
app.tablelink.be         # Guest interface, restaurant dashboard
```

### Core Tech Stack
- **Frontend**: Next.js 14 (App Router) - React framework with server-side rendering
- **Hosting**: Vercel - Edge functions, seamless deployment
- **AI Gateway**: Vercel AI Gateway - Provider flexibility, cost control
- **Database**: Supabase - PostgreSQL with real-time subscriptions, auth, storage
- **AI Model**: GPT-4 via Vercel AI Gateway (abstracted for easy switching)
- **Payments**: Stripe (for paid tiers)

### System Flow
```
Guest Mobile Device
    ↓ QR Code Scan
app.tablelink.be/[restaurant-id]
    ↓
Next.js App (Vercel Edge)
    ↓                     ↓
Vercel AI Gateway    Supabase
    ↓                     ↓
GPT-4              Database/Storage
```

## Implementation Strategy

### MVP (14-day sprint)
1. **Days 1-3**: Core chat interface with hardcoded menu data
2. **Days 4-6**: Menu extraction and multilingual support
3. **Days 7-9**: QR generation and restaurant onboarding
4. **Days 10-12**: Customer acquisition
5. **Days 13-14**: Launch with first restaurant

### Pricing Model (SaaS)
- **Free Tier**: €0/month - 100 interactions, 2 languages
- **Professional**: €29/month - 1,000 interactions, unlimited languages, customization
- **Premium**: €79/month - Unlimited usage, API access, advanced analytics

## Developer Considerations

### Performance Optimization
- Edge deployment for low latency
- Response caching for common questions
- Streaming AI responses
- Image optimization for menu uploads

### Security & Privacy
- No personal data collection from guests
- Anonymous session tracking
- GDPR compliant
- Secure file upload handling

### Scalability
- Serverless architecture scales automatically
- Database connection pooling
- Rate limiting per restaurant
- CDN for static assets

### AI Cost Management
- Token tracking per conversation
- Intelligent prompt engineering
- Caching layer for repeated questions
- Fallback to GPT-3.5 for cost control

## What Makes TableLink Different

1. **Complement, not replacement**: Works alongside paper menus
2. **No app downloads**: Web-based, instant access
3. **Restaurant-first design**: Minimal operational disruption
4. **Focus on information**: Not an ordering system
5. **Anonymous for guests**: No registration required

## For Contributing Developers

### Getting Started
```bash
# Clone and setup
git clone https://github.com/[org]/tablelink-app
cd tablelink-app
npm install

# Environment variables
cp .env.example .env.local
# Add your API keys

# Run locally
npm run dev
```

### Key Development Principles
- Mobile-first design (95% of users)
- Accessibility is mandatory
- Keep responses under 100ms
- Fail gracefully with offline support
- Test with real restaurant data

### API Design Philosophy
- RESTful endpoints for CRUD operations
- GraphQL consideration for complex queries
- Webhook support for menu updates
- Rate limiting by tenant

This architecture enables restaurants to enhance their service without disrupting operations, while giving developers a modern, scalable platform to build upon.