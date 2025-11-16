# Analytics & Feedback Collection

> **Part of:** [Technical Requirements](../README.md) | **Previous:** [Technical Constraints](07e-technical-constraints.md) | **Next:** [Dependencies & Risks](../08-dependencies-and-risks/)

---

# Analytics & Feedback Collection

## Analytics Requirements

**Purpose:** Track usage patterns, measure success metrics, and identify improvement opportunities.

**What to Track (Privacy-Conscious):**
- **Usage Metrics:**
  - Number of conversions per session
  - Output mode selection distribution (Regular vs Shopify Blogs vs Shopify Shoppables)
  - Optional feature usage (which checkboxes are enabled)
  - Average processing time per conversion
  - Content size distribution (small/medium/large documents)
  - Preview toggle usage (code view vs rendered view)

- **Performance Metrics:**
  - Processing success rate (successful conversions vs errors)
  - Error types and frequency
  - Browser/device information (for compatibility tracking)
  - Processing time distribution

- **User Behavior:**
  - Session duration
  - Copy-to-clipboard actions (indicates successful conversion)
  - Download actions (if P1 feature implemented)
  - Page views and bounce rate

**What NOT to Track (Privacy):**
- ❌ Actual HTML content (no content stored or sent to servers)
- ❌ User IP addresses or personal identifiers
- ❌ User location data
- ❌ Cross-site tracking

**Implementation:**
- Use privacy-focused analytics (e.g., Plausible, Simple Analytics, or self-hosted Matomo)
- OR: Minimal Google Analytics 4 with IP anonymization enabled
- Client-side only, no server-side tracking
- Respect Do Not Track (DNT) browser settings
- Cookie consent banner if required by jurisdiction

**Data Retention:**
- Aggregate data only (no individual user tracking)
- Retention period: 12 months for aggregate metrics
- No personal data collection

---

## User Feedback Collection

**Purpose:** Measure user satisfaction, gather improvement suggestions, and validate success metrics.

### Post-Conversion Survey (P1)

**Trigger:** Optional survey after successful conversion (non-intrusive)

**Questions:**
1. **Satisfaction Rating:** "How satisfied are you with the cleaned HTML output?" 
   - Scale: 1-5 (1 = Very Dissatisfied, 5 = Very Satisfied)
   - Required for success metric tracking

2. **NPS Score (Optional):** "How likely are you to recommend this tool to a colleague?"
   - Scale: 0-10 (NPS standard)
   - Optional, but valuable for measuring advocacy

3. **Open Feedback (Optional):** "Any suggestions for improvement?"
   - Free text field
   - Optional

**Implementation:**
- Show survey as non-blocking modal or banner after 3+ successful conversions
- Allow users to dismiss permanently
- Store feedback in client-side only (localStorage) or send to simple backend endpoint
- No personal information required

### In-App Feedback Button (P2)

**Location:** Footer or Help section

**Purpose:** Allow users to submit feedback at any time

**Fields:**
- Feedback type: Bug report / Feature request / General feedback
- Description (free text)
- Optional: Email for follow-up (not required)

**Implementation:**
- Simple form or link to GitHub Issues (if open source)
- OR: Email link or contact form
- No tracking of who submitted feedback

---

## Success Metrics Measurement

**Alignment with Goals & Success Metrics:**
- See [Goals & Success Metrics](../03-goals-and-success-metrics.md) for detailed measurement requirements

**Key Metrics to Measure:**
1. **95%+ Accuracy:** Track via automated tests + manual QA review (not user-facing)
2. **100% Structure Preservation:** Automated DOM comparison tests
3. **80% Time Reduction:** User survey question: "How long did it take you to clean this HTML?" (before/after comparison)
4. **90% User Satisfaction:** Post-conversion survey question #1 (satisfaction rating)

**Measurement Timeline:**
- **Alpha (Week 1-2):** Internal testing, automated metrics
- **Closed Beta (Week 3-5):** User surveys, time-tracking
- **Open Beta (Week 6-8):** Full analytics, satisfaction surveys
- **GA (Week 9+):** Ongoing monitoring

---

## Error Tracking

**Purpose:** Identify and fix bugs quickly

**What to Track:**
- Error types (parsing errors, processing failures, browser compatibility issues)
- Error frequency
- Browser/device information for errors
- Stack traces (sanitized, no user content)

**Implementation:**
- Client-side error logging (console.error)
- Optional: Error reporting service (e.g., Sentry) with privacy settings
- No user content in error reports
- Aggregate error statistics only

---

## Privacy & Compliance

**GDPR Compliance:**
- No personal data collection
- No cookies for tracking (or explicit consent if needed)
- Clear privacy policy explaining what data is collected (if any)
- User can opt-out of analytics (Do Not Track)

**Data Minimization:**
- Collect only aggregate, anonymized metrics
- No individual user profiles
- No cross-site tracking
- All processing client-side (no server-side data storage)

---

**See also:**
- [Goals & Success Metrics](../03-goals-and-success-metrics.md) - Success measurement requirements
- [Technical Constraints](07e-technical-constraints.md) - Privacy and security considerations
- [Launch Plan & Rollout Strategy](../implementation/) - Measurement timeline

