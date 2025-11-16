# The Complete Guide to Writing Product Requirements Documents (PRDs)

## What is a PRD?

A Product Requirements Document (PRD) is a comprehensive blueprint that defines what you're building, why you're building it, and how success will be measured. It serves as the single source of truth that aligns engineering, design, marketing, and leadership around a shared vision.

**A good PRD answers:**
- What problem are we solving?
- Who are we solving it for?
- Why does this matter now?
- What does success look like?
- What are we building (and not building)?

---

## When to Write a PRD

**Write a PRD when:**
- ✓ Building a new feature or product
- ✓ Making significant changes to existing functionality
- ✓ Multiple teams need to coordinate work
- ✓ Project timeline exceeds 2-4 weeks
- ✓ Resource allocation needs justification

**Skip the PRD when:**
- ✗ Making minor UI tweaks or bug fixes
- ✗ Running quick experiments (use a 1-pager instead)
- ✗ Prototyping or discovery work
- ✗ Internal tooling for a single developer

---

## PRD Template Structure

### 1. Header & Metadata

```
Title: [Feature/Product Name]
Author: [Your Name]
Stakeholders: [PM, Eng Lead, Design Lead, etc.]
Status: [Draft | In Review | Approved | Archived]
Last Updated: [Date]
Target Launch: [Q2 2025 or specific date]
```

**Purpose:** Quick reference and version control.

---

### 2. Executive Summary (TL;DR)

**Length:** 2-4 sentences  
**Audience:** Executives who won't read the full doc

Write this last, after completing the rest of the document.

**Template:**
> We're building [WHAT] for [WHO] because [PROBLEM]. This will [IMPACT] and we'll measure success by [METRIC]. Expected launch: [DATE].

**Example:**
> We're building a collaborative playlist feature for Spotify Free users because 68% report sharing music socially but lack tools to do so within the app. This will increase user engagement by an estimated 15% and reduce churn by 8%. Success metrics: 30% of Free users create a collaborative playlist within 60 days. Expected launch: Q3 2025.

---

### 3. Problem Statement

**Length:** 1-2 paragraphs  
**Purpose:** Clearly define the problem you're solving

**Framework: "User + Pain + Impact"**

```
[USER SEGMENT] currently struggles with [SPECIFIC PROBLEM] 
which results in [NEGATIVE OUTCOME]. 

This matters because [BUSINESS IMPACT or USER IMPACT].
```

**Good Example:**
> Small business owners using our invoicing platform currently spend 15-20 minutes manually entering client data for each new project, which results in delayed billing and increased data entry errors (22% error rate according to user research). This matters because delayed invoicing directly impacts their cash flow, and data errors create customer service headaches that erode trust in our platform. User interviews reveal this is the #1 friction point in onboarding.

**Bad Example:**
> Users want a better experience. Our current system is slow and outdated.

**Red Flags:**
- Using "we need" instead of "users need"
- Jumping to solutions without defining the problem
- Vague terms like "improve," "optimize," "enhance" without specifics

---

### 4. Goals & Success Metrics

**Goals:** What you're trying to achieve (qualitative)  
**Success Metrics:** How you'll measure it (quantitative)

#### Goals Framework

Use OKRs (Objectives & Key Results):

**Objective:** The qualitative goal (inspiring, directional)  
**Key Results:** 2-4 quantifiable outcomes

**Template:**
```
Objective: [Ambitious, qualitative goal]

Key Results:
1. [Metric] increases from [X] to [Y] by [DATE]
2. [Metric] decreases from [X] to [Y] by [DATE]
3. [Metric] achieves [Z%] by [DATE]
```

**Example:**
```
Objective: Make collaborative music discovery seamless for Free users

Key Results:
1. 30% of Free users create at least one collaborative playlist within 60 days
2. Average session time increases from 18 min to 25 min (+38%)
3. 7-day retention improves from 42% to 50% for users who engage with feature
4. NPS score for Free tier increases by 12 points
```

#### Metrics Hierarchy

**Primary Metric:** The one number that defines success  
**Secondary Metrics:** Supporting indicators  
**Guardrail Metrics:** Things that shouldn't get worse

**Example:**
- **Primary:** 30% adoption rate within 60 days
- **Secondary:** 5 collaborators added per playlist average, 20% share rate
- **Guardrail:** App load time stays under 2s, crash rate stays below 0.5%

---

### 5. User Personas & Use Cases

#### User Personas

Define 1-3 primary personas who will use this feature.

**Template:**
```
Persona: [Name/Title]
Demographics: [Age, location, tech savviness]
Goals: [What they want to achieve]
Pain Points: [Current frustrations]
Context: [When/where they'll use this]
Frequency: [Daily | Weekly | Monthly | Rarely]
```

**Example:**
```
Persona: Sarah, the Social Curator
Demographics: 24, urban, heavy social media user
Goals: Share music taste with friends, discover new songs together
Pain Points: Spotify Free limits collaboration; uses external docs to share links
Context: Planning weekend hangouts, creating road trip playlists with friends
Frequency: 2-3 times per week
Quote: "I spend more time texting Spotify links than actually listening together"
```

#### Use Cases

Walk through 3-5 specific scenarios.

**Template:**
```
Use Case: [Title]
Actor: [Which persona]
Precondition: [Starting state]
Trigger: [What initiates the action]
Steps: [Numbered list of actions]
Success Criteria: [How user knows it worked]
Failure Scenarios: [What could go wrong]
```

**Example:**
```
Use Case: Creating a Collaborative Road Trip Playlist

Actor: Sarah (Social Curator)
Precondition: Sarah has a Free Spotify account with 3+ friends on the platform
Trigger: Sarah wants to create a playlist for an upcoming road trip

Steps:
1. Sarah opens Spotify and navigates to "Your Library"
2. Taps "Create Playlist" and names it "Beach Weekend 2025"
3. Toggles "Collaborative" switch in playlist settings
4. Taps "Invite Friends" and selects 4 friends from her Spotify connections
5. Friends receive in-app notification and accept invite
6. All 5 users can now add/remove/reorder songs
7. Playlist updates in real-time for all collaborators

Success Criteria: All invited friends can see and edit the playlist within 30 seconds
Failure Scenarios: 
- Friend has notifications disabled (show in-app badge next time they open app)
- Network connectivity issues (queue changes locally, sync when online)
```

---

### 6. Scope & Requirements

#### What We're Building (In Scope)

Be specific. Use user stories format:

**User Story Template:**
> As a [USER TYPE], I want to [ACTION] so that [BENEFIT].

**Prioritization: MoSCoW Method**

- **Must Have:** Non-negotiable for launch
- **Should Have:** Important but not critical
- **Could Have:** Nice-to-haves if time permits
- **Won't Have:** Explicitly out of scope (for now)

**Example:**

**Must Have (P0):**
- As a Free user, I want to create a collaborative playlist so that friends can add songs
- As a collaborator, I want to receive a notification when invited so I know to participate
- As a playlist owner, I want to remove collaborators so I can control access
- As any collaborator, I want to see who added which song so I can give credit

**Should Have (P1):**
- As a collaborator, I want to comment on songs so we can discuss choices
- As a playlist owner, I want to set permissions (add only vs. full edit) so I can control changes
- As a Free user, I want to see when others are actively editing so I avoid conflicts

**Could Have (P2):**
- As a collaborator, I want to upvote songs so we can rank favorites
- As a playlist owner, I want to generate a shareable link so non-Spotify users can view

**Won't Have (this version):**
- Real-time video/voice chat while listening together
- AI-suggested songs based on all collaborators' tastes
- Integration with third-party apps (Discord, Instagram)
- Voting system for song inclusion/removal

---

#### What We're NOT Building (Out of Scope)

Be explicit about what's excluded and why.

**Example:**
```
❌ Premium-only features (collaborative queue control)
   Reason: Focuses resources on Free tier activation

❌ Cross-platform collaborative listening (simultaneous playback)
   Reason: Technical complexity exceeds this release cycle; consider for v2

❌ Analytics dashboard for playlist owners
   Reason: User research shows low demand (8% requested); prioritize core workflow
```

---

### 7. User Experience & Design

**Do NOT include:**
- Detailed mockups (those go in design specs)
- Final UI decisions

**DO include:**
- User flow diagrams
- Key screens/states to design
- Interaction principles
- Edge cases designers must consider

#### User Flow Example

```
Entry Points:
→ "Create Playlist" button (Your Library)
→ Existing playlist settings (toggle collaborative)
→ Deep link from invitation

Core Flow:
[Create Playlist] → [Enable Collaborative] → [Invite Friends] → 
[Friends Accept] → [All Edit] → [Playlist Updates Real-Time]

Exit Points:
→ Leave playlist (remove self as collaborator)
→ Owner deletes playlist (notify all collaborators)
→ Convert to private (disable collaborative)
```

#### Key Screens to Design

```
1. Playlist Settings Screen
   - Collaborative toggle (on/off)
   - Invite button
   - Current collaborators list
   - Permission settings (if P1 is included)

2. Invite Friends Modal
   - Search/filter Spotify connections
   - Multi-select interface
   - Preview of invitation message
   - Send button

3. Notification (In-App & Push)
   - "[Friend] invited you to collaborate on [Playlist Name]"
   - Accept/Decline buttons
   - Preview: playlist cover + song count

4. Collaborative Playlist View
   - Visual indicator (icon/badge) that it's collaborative
   - "Added by [Name]" under each song
   - Active editors indicator (if P1)
```

#### Interaction Principles

```
✓ Real-time updates: Changes appear within 2 seconds for all users
✓ Optimistic UI: Show changes immediately, rollback on failure
✓ Conflict resolution: Last edit wins; no merge conflicts
✓ Feedback: Toast notification when someone adds/removes songs
✓ Permissions: Clear visual difference between owner and collaborators
```

#### Edge Cases for Design

```
- What if 20+ people are invited? (Scrollable list with search)
- What if network is offline? (Show "syncing" state, queue changes)
- What if someone adds 100 songs at once? (Show loading indicator, batch updates)
- What if playlist exceeds Free tier limits? (10,000 songs max - show warning at 9,500)
- What if user is blocked by inviter? (Show error: "Unable to invite this user")
```

---

### 8. Technical Requirements & Considerations

**Purpose:** Give engineering what they need to estimate and plan.

**Do NOT include:**
- Detailed architecture (that's for tech specs)
- Code-level implementation

**DO include:**
- Data requirements
- API/integration needs
- Performance requirements
- Platform considerations
- Known technical constraints

#### Data Requirements

**What data needs to be stored:**
```
Playlist Table (new fields):
- is_collaborative: boolean
- collaborator_ids: array[user_id]
- permissions: enum[full_edit | add_only]

Song Table (new fields):
- added_by_user_id: integer
- added_at: timestamp

Notification Table:
- type: "playlist_invite"
- sender_id, recipient_id, playlist_id
- status: enum[pending | accepted | declined]
```

**Data volume estimates:**
```
- Expected 500K collaborative playlists in first 90 days
- Average 4 collaborators per playlist
- 2M invitations sent (40% acceptance rate)
- 15M song additions tracked
```

#### API & Integration Needs

```
New Endpoints Required:
- POST /playlists/{id}/collaborators (invite users)
- GET /playlists/{id}/collaborators (list current)
- DELETE /playlists/{id}/collaborators/{user_id} (remove)
- POST /playlists/{id}/toggle-collaborative

Third-Party Dependencies:
- Push notification service (Firebase/APNs)
- Real-time sync (WebSocket or polling?)

External APIs:
- None required (all internal Spotify APIs)
```

#### Performance Requirements

```
Response Time:
- Playlist load: < 500ms (p95)
- Song addition: < 200ms (p95)
- Real-time sync: < 2s latency

Scalability:
- Support 1M concurrent collaborative sessions
- Handle 100 song additions per second per playlist

Availability:
- 99.9% uptime (standard for user-facing features)
- Graceful degradation if real-time sync fails (fall back to polling)
```

#### Platform Considerations

```
Supported Platforms:
- iOS (15.0+)
- Android (API 23+)
- Web (desktop + mobile web)

Not Supported:
- Spotify TV/Car (v2 consideration)
- Third-party API access (internal only)

Cross-Platform Sync:
- All platforms must sync within 2 seconds
- Offline mode: queue changes, sync when online
```

#### Technical Constraints

```
Known Limitations:
- Spotify Free API rate limits: 100 requests/minute per user
  Impact: May need to batch notifications for large collaborator lists

- Real-time infrastructure: Currently supports 10K WebSocket connections
  Impact: Need capacity planning before launch

- Database: PostgreSQL (sharding strategy needed if > 1M playlists)

Security Considerations:
- Validate user permissions before any playlist modification
- Rate limit invitations (max 50 per hour per user) to prevent spam
- Encrypt playlist_id in shareable links
```

---

### 9. Dependencies & Risks

#### Dependencies

**Internal Dependencies:**
```
Team/System: [What you need from them]
Status: [Blocked | In Progress | Complete]
Owner: [Name]
ETA: [Date]

Example:
- Notifications Platform: Push notification support for new "playlist_invite" type
  Status: In Progress | Owner: Jane Doe (Platform Team) | ETA: April 15, 2025
```

**External Dependencies:**
```
- None identified
```

#### Risks & Mitigation

**Risk Template:**
```
Risk: [What could go wrong]
Likelihood: [High | Medium | Low]
Impact: [High | Medium | Low]
Mitigation: [What we'll do about it]
Owner: [Who's responsible]
```

**Example Risks:**

```
Risk: Real-time sync performance degrades with > 10 collaborators
Likelihood: Medium | Impact: High
Mitigation: 
- Load test with 50 collaborators per playlist
- Implement rate limiting on song additions (max 10 per minute)
- Fall back to polling if WebSocket fails
Owner: Engineering Lead

Risk: Users spam invitations, creating bad experience
Likelihood: Low | Impact: Medium
Mitigation:
- Rate limit: 50 invitations per hour per user
- Allow users to block future invites from specific users
- Monitor for abuse patterns in first 2 weeks post-launch
Owner: Product Manager

Risk: Feature cannibalizes Premium subscriptions
Likelihood: Low | Impact: High
Mitigation:
- A/B test with 10% of Free users first
- Monitor Premium upgrade rate closely (guardrail metric)
- Keep Premium-exclusive collaborative features (queue control, offline sync)
Owner: Product Lead + Data Analyst
```

---

### 10. Launch Plan & Rollout Strategy

#### Rollout Phases

**Phase 1: Internal Alpha (Week 1-2)**
- Audience: Spotify employees only (500 users)
- Goal: Catch critical bugs, validate basic functionality
- Success Criteria: < 5 P0 bugs, 80% feature completion rate

**Phase 2: Closed Beta (Week 3-6)**
- Audience: 5,000 power users (opted into beta program)
- Goal: Validate user experience, gather qualitative feedback
- Success Criteria: NPS > 40, < 10 P1 bugs, 60% weekly engagement

**Phase 3: Open Beta (Week 7-10)**
- Audience: 10% of Free users (randomized, ~2M users)
- Goal: Load testing, monitor metrics at scale
- Success Criteria: Hit 50% of KR targets, no performance degradation

**Phase 4: General Availability (Week 11+)**
- Audience: 100% of Free users globally
- Goal: Full launch, measure final KRs
- Kill Switch: Ready to disable feature if crash rate > 2%

#### Go-to-Market Plan

**Marketing:**
- Blog post: "Introducing Collaborative Playlists for Free Users"
- In-app banner for 2 weeks post-launch
- Social media campaign (Instagram, TikTok): #SpotifyTogether
- Email to Free users highlighting feature

**Support:**
- Update Help Center with FAQs
- Train support team on common issues (week before launch)
- Monitor social media/support tickets for first 72 hours

**Metrics Dashboard:**
- Real-time monitoring of adoption, engagement, errors
- Daily standups for first week post-launch
- Weekly reviews for first month

#### Success Criteria for Launch

**Go/No-Go Checklist (must pass before Phase 4):**
- [ ] < 0.5% crash rate in Open Beta
- [ ] 95% of invited users receive notifications within 5 seconds
- [ ] Real-time sync works for 95% of song additions
- [ ] Zero data loss incidents in Beta
- [ ] Help Center docs published
- [ ] All P0 and P1 bugs resolved

**Post-Launch (30 days):**
- [ ] 20% of Free users have created/joined a collaborative playlist
- [ ] 40% of those users are still active (7-day retention)
- [ ] NPS increase of +8 points for users who used feature

---

### 11. Open Questions & Decisions Needed

Track unresolved items that need input before proceeding.

**Template:**
```
Question: [What needs to be decided]
Options: [List alternatives]
Recommendation: [Your suggested path]
Decision Maker: [Who decides]
Deadline: [When decision is needed]
Status: [Open | Resolved]
```

**Examples:**

```
Question: Should we allow anonymous (non-Spotify) users to view collaborative playlists via shareable link?
Options:
  A. Yes - increases viral potential, lowers barrier
  B. No - keeps feature exclusive to Spotify users, drives signups
Recommendation: Option B (drives signups, easier to implement)
Decision Maker: Product Lead + Marketing Lead
Deadline: March 1, 2025
Status: Open

---

Question: What's the maximum number of collaborators per playlist?
Options:
  A. 10 (conservative, easier to manage performance)
  B. 50 (more flexible, higher complexity)
  C. Unlimited (maximum flexibility, significant engineering effort)
Recommendation: Option B (50) - balances usability with technical feasibility
Decision Maker: Engineering Lead + Product Manager
Deadline: February 15, 2025
Status: Resolved → Going with Option B

---

Question: Should we notify all collaborators when someone adds a song?
Options:
  A. Yes - keeps everyone engaged and aware
  B. No - reduces notification fatigue
  C. User preference (opt-in/opt-out)
Recommendation: Option C - let users decide
Decision Maker: Product Manager + UX Lead
Deadline: March 10, 2025
Status: Open
```

---

### 12. Appendix (Optional)

**Include as needed:**
- User research summaries
- Competitive analysis
- Prototypes/mockups (link to Figma)
- Data analysis (link to dashboards)
- Interview transcripts
- Market research
- Legal/compliance considerations

**Example:**
```
Appendix A: User Research Summary
- 42 user interviews conducted (Oct-Nov 2024)
- Survey: 1,200 Free users (Dec 2024)
- Key insight: 68% share music via screenshots/links outside Spotify
- Full report: [Link to research doc]

Appendix B: Competitive Analysis
- Apple Music: Family Sharing playlists (up to 6 users)
- YouTube Music: Collaborative playlists (unlimited users, no real-time)
- Soundcloud: Public playlists only (no true collaboration)
- Gap: No competitor offers real-time collaboration for free tier

Appendix C: Legal Review
- Privacy: User consent required before showing "Added by [Name]"
- COPPA compliance: Users under 13 cannot invite/be invited
- GDPR: Right to be forgotten includes removal from all playlists
- Status: Legal sign-off received Dec 15, 2024
```

---

## PRD Best Practices

### Writing Tips

**Be Specific, Not Vague:**
- ❌ "Improve user engagement"
- ✅ "Increase 7-day retention from 42% to 50%"

**Use Data:**
- ❌ "Users want this feature"
- ✅ "68% of surveyed users (n=1,200) report sharing music socially"

**Think in User Outcomes:**
- ❌ "Build a collaborative playlist feature"
- ✅ "Enable friends to create music collections together seamlessly"

**Avoid Solution Bias:**
- ❌ Start with "We need a button that..."
- ✅ Start with "Users struggle to..."

**Write for Scanning:**
- Use headers, bullet points, tables
- Bold key terms
- Keep paragraphs under 4 lines
- Add visual breaks

### Common Mistakes to Avoid

**1. Jumping to Solutions**
- Don't lead with "what" before explaining "why"
- Spend 50% of PRD on problem/context, 50% on solution

**2. Unclear Success Metrics**
- Avoid vanity metrics ("increase engagement")
- Use specific, measurable outcomes

**3. Scope Creep**
- Be ruthless about "Won't Have" section
- V1 should be minimal viable, not perfect

**4. Ignoring Edge Cases**
- Think through failure states, errors, offline mode
- Ask "What if..." questions

**5. Writing for Yourself**
- PRD is for the team, not just documentation
- Test readability: can a new engineer understand it?

### Collaboration Tips

**When to Involve Others:**

**Before Writing:**
- Product Lead: Validate problem/opportunity
- Engineering Lead: Discuss feasibility
- Design Lead: Align on user experience vision

**During Writing:**
- Engineers: Technical requirements, edge cases
- Designers: User flows, key screens
- Data: Metrics definitions, baseline numbers

**After First Draft:**
- All stakeholders: Review and comment (async)
- Sync meeting: Resolve open questions, align on scope

**Review Checklist:**
- [ ] Problem is clearly articulated with data
- [ ] Success metrics are specific and measurable
- [ ] Scope is clear (MoSCoW prioritization)
- [ ] Edge cases are documented
- [ ] Technical feasibility is validated
- [ ] Launch plan is realistic
- [ ] All open questions have owners and deadlines

---

## PRD Variants by Company Size

### Startup (< 50 people)
- **Length:** 2-4 pages
- **Focus:** Problem, solution, metrics
- **Skip:** Lengthy appendices, formal approval process
- **Format:** Google Doc or Notion

### Mid-Size (50-500 people)
- **Length:** 5-10 pages
- **Focus:** Full template (all sections)
- **Include:** Dependencies, rollout plan
- **Format:** Confluence, Productboard, or similar

### Enterprise (500+ people)
- **Length:** 10-20 pages
- **Focus:** Everything + compliance, integrations
- **Include:** Legal review, security assessment, stakeholder matrix
- **Format:** Company-specific tooling (Jira, Monday.com, etc.)

---

## Real-World PRD Example (Condensed)

### Title: Collaborative Playlists for Spotify Free

**Status:** Approved | **Author:** Jordan Smith | **Launch:** Q3 2025

---

#### Executive Summary
We're building collaborative playlists for Spotify Free users because 68% report sharing music socially but lack in-app tools. This will increase 7-day retention by 8% and engagement by 15%. Success: 30% of Free users create a collaborative playlist within 60 days of launch.

---

#### Problem Statement
Free users (120M globally) share music via screenshots, external links, and messaging apps—creating friction and pulling them out of Spotify. User research shows 68% want to collaborate on playlists with friends, but this feature is unavailable on Free tier. This results in lower engagement (18 min avg session vs. 25 min for Premium) and higher churn (42% 7-day retention vs. 58%).

---

#### Goals & Success Metrics

**Objective:** Make collaborative music discovery seamless for Free users

**Key Results:**
1. 30% of Free users create/join collaborative playlist within 60 days
2. 7-day retention improves from 42% → 50% for engaged users
3. Average session time increases from 18 min → 25 min
4. NPS for Free tier increases by +12 points

**Guardrail Metrics:**
- Premium upgrade rate stays flat or increases
- App crash rate < 0.5%

---

#### Scope

**Must Have (P0):**
- Create collaborative playlist (toggle in settings)
- Invite friends (search Spotify connections)
- Real-time sync (changes appear within 2 seconds)
- Notifications (in-app + push for invites)

**Won't Have:**
- Cross-platform simultaneous playback
- AI song suggestions
- Third-party integrations

---

#### Launch Plan
- Phase 1: Internal Alpha (500 users, 2 weeks)
- Phase 2: Closed Beta (5K users, 4 weeks)
- Phase 3: Open Beta (10% Free users, 4 weeks)
- Phase 4: GA (100% Free users)

**Go-Live Date:** July 15, 2025

---

## Conclusion

A great PRD is:
- **Clear:** Anyone can understand the problem and solution
- **Specific:** Measurable outcomes, not vague goals
- **Actionable:** Teams know exactly what to build
- **Collaborative:** Input from all stakeholders

**Remember:** The PRD is a living document. Update it as you learn, decide, and ship.

**Final Checklist:**
- [ ] Problem is worth solving (validated with users)
- [ ] Solution is feasible (validated with engineering)
- [ ] Success is measurable (specific metrics defined)
- [ ] Scope is realistic (MVP approach)
- [ ] Team is aligned (stakeholder sign-off)

Now go write a PRD that ships great products! 🚀
