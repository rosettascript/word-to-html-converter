# Rollout Phases

> **Part of:** [Launch Plan & Rollout Strategy](../README.md) | **Previous:** [Risks & Mitigation](../../08-dependencies-and-risks/08b-risks-and-mitigation.md) | **Next:** [Go-to-Market Plan](10b-go-to-market-plan.md)

---

# Rollout Phases

## Phase 1: Internal Alpha (Week 1-2)
**Audience:** Internal team and close collaborators (10-20 users)

**Goal:** Validate core functionality, catch critical bugs, ensure basic functionality works

**Success Criteria:**
- < 3 P0 bugs reported
- 90% of test documents process successfully
- Processing time < 1 second for typical documents (client-side, instant)
- All test users can complete basic workflow (paste → process → copy)

**Deliverables:**
- Basic web UI with paste functionality (vanilla HTML/CSS/JavaScript)
- Output mode selector (Regular, Shopify Blogs, Shopify Shoppables)
- Instant conversion (no button, processes as user types/pastes)
- Core HTML cleaning (remove inline styles, preserve structure)
- Regular mode functionality
- Preview toggle (icon button to switch between code view and rendered preview view)
- Preview and copy functionality
- Basic error handling
- GitHub Pages deployment setup
- SEO page structure (Hero, Converter, Features, About, Footer, FAQ sections)

---

## Phase 2: Closed Beta (Week 3-5)
**Audience:** 50-100 selected users (content writers and developers from target communities)

**Goal:** Gather qualitative feedback, validate user experience, identify edge cases

**Success Criteria:**
- 80% user satisfaction (survey)
- < 5 P1 bugs reported
- 70% of users successfully process documents without issues
- Average processing time meets targets (< 5 seconds)

**Deliverables:**
- Shopify Blogs mode with all formatting rules
- Shopify Shoppables mode with all formatting rules
- Optional features checkboxes (Put <strong> in headers, Remove domain in links, Remove spacing)
- Improved error messages and user feedback
- File download functionality (P1)
- Enhanced UI/UX based on alpha feedback
- Basic client-side analytics (if needed, via localStorage or simple tracking)
- Complete SEO optimization (keyword placement, meta tags, structured content)

**Feedback Collection:**
- User survey after first use
- Optional follow-up interviews with 5-10 users
- Monitor support requests and common issues

---

## Phase 3: Open Beta (Week 6-8)
**Audience:** Public beta (unlimited users, promoted in relevant communities)

**Goal:** Load testing at scale, monitor performance, gather broader feedback

**Success Criteria:**
- 95%+ processing success rate across all output modes
- No performance degradation with increased load
- 85%+ user satisfaction
- < 1% error rate
- Handle 500+ documents per day
- All three output modes tested and working correctly
- Instant conversion performs well (< 100ms for typical documents)

**Deliverables:**
- Production-ready GitHub Pages deployment
- JavaScript library for integration (P1)
- Comprehensive error handling
- Public documentation/help center

**Promotion:**
- Share in Shopify community forums
- Post on Product Hunt (beta launch)
- Share in developer communities (Reddit, Twitter, etc.)
- Reach out to content creator communities

---

## Phase 4: General Availability (Week 9+)
**Audience:** All users (public launch)

**Goal:** Full launch, measure final success metrics, iterate based on usage

**Success Criteria:**
- All Key Results from Goals & Success Metrics section achieved
- 99%+ uptime
- < 0.5% error rate
- Positive user feedback and adoption

**Deliverables:**
- Stable, scalable platform
- Complete documentation
- Support processes in place
- Monitoring and analytics dashboard

**Kill Switch:** Ready to disable feature or rollback if:
- Error rate > 2%
- Critical security vulnerability discovered
- Performance degradation affects > 10% of users


---

**See also:**
- [Go-to-Market Plan](10b-go-to-market-plan.md) - Marketing strategy
- [Success Criteria for Launch](10c-success-criteria-launch.md) - Launch checklist
