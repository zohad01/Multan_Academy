# Architecture Addendum – Additional Features
## Online Teaching Platform

This document defines the additional features requested after the initial
architecture approval. These items extend the original scope and require
separate implementation planning. The following is a structured, Cursor-ready overview.

---

## 1. Introductory & Free Preview Videos

**Description**
- Add a global introductory video explaining platform usage.
- Add a free course introduction video accessible without payment.

**Technical Notes**
- Public access route (no authentication required)
- Separate logic from paid courses
- Use CDN or optimized streaming for performance

**Dependencies**
- Video hosting platform (AWS, Vimeo, etc.)

---

## 2. Advanced Video Content Protection

**Description**
- Extend existing watermark system
- Add technical restrictions to reduce screenshots or screen recordings (best-effort)

**Technical Approach**
- Auth-based video session tokens
- Disable right-click and dev-tools shortcuts on frontend
- Stream video via secured URLs
- Include disclaimer: full prevention cannot be guaranteed on the web

**Dependencies**
- Video hosting platform capabilities

---

## 3. Authentication Flow Enhancement

**Description**
- Separate login flows for Students and Teachers
- Clear UI distinction to prevent confusion

**Technical Notes**
- Role-based routing
- Dedicated login pages or toggle options
- Backend role validation

---

## 4. Live Class Feature

**Description**
- Real-time live classes between teachers and students

**Technical Approach**
- Third-party integration: Zoom, Google Meet, or WebRTC
- Scheduling system
- Role-based access control: only enrolled students can join

**Dependencies**
- Client must provide preferred live-class provider credentials
- Zoom Pro recommended for production; Free plan only supports 40-minute sessions

**Notes**
- Custom WebRTC is possible but significantly increases cost and complexity
- For budget-friendly options, Zoom/Meet is preferred

---

## 5. Automated Logout & Session Control

**Description**
- Admin-defined session duration
- Automatic logout after inactivity or time limit

**Technical Notes**
- Backend session tracking
- Token expiry enforcement
- Admin configuration panel

---

## 6. Certificate Automation Enhancements

**Description**
- Students can enter their name before generating certificates
- Subject-wise certificates
- Automated PDF generation and download

**Technical Notes**
- Template-based certificate engine
- Verification checks for course completion

---

## 7. Social Media Integration

**Description**
- Add official social media links: Instagram, Facebook, TikTok

**Technical Notes**
- Admin-manageable links
- Integrate into footer and contact sections

---

## 8. Gmail / Email Access Clarification

**Description**
- Specify which devices students can use for Gmail access (Mobile, Laptop, Web)

**Notes**
- No direct Gmail access unless OAuth/email integration is approved
- Platform email handled via SMTP or transactional service

---

## 9. Mock Payments Clarification

**Description**
- Mock payments are for testing only
- No real money transactions in mock mode

**Technical Notes**
- Environment-based payment switching (test vs live)
- UI indicates clearly when in test mode

---

## 10. Impact Summary

These additions introduce:
- New backend logic
- Additional security layers
- Third-party integrations
- Expanded testing and QA scope

**Conclusion**
- All features are **outside the original architecture**.
- Separate cost, timeline, and client approval required before implementation.

---

## 11. Client Dependencies & Requirements

1. Zoom / Live Class provider credentials  
2. Video hosting credentials (AWS, Vimeo, etc.)  
3. Payment gateway API keys for live payments  
4. Certificate templates (logos, design)  
5. Social media URLs  
6. Admin decisions on session timeout and access levels  
7. Approval on advanced video protection expectations  

---

**Cursor Instructions:**  
Use this addendum to implement, update, and test each feature **step by step**.  
All features are modular and **should be treated as separate from the original architecture**.  
Each module includes technical notes, dependencies, and required approvals.
