Create a new Marketplace section inside the Fin-Game mobile app.

This module is:

Egypt’s comprehensive financial product comparison platform integrated into the gamified system.

⚠️ Do NOT redesign the app.
⚠️ Use the same design system, components, shadows, button style, and layout grid already implemented.
⚠️ Maintain the same yellow/blue branding and EGP currency format.

1️⃣ Marketplace Entry Point (Home Integration)

Add a new card on Dashboard:

Card Title:
Financial Marketplace

Description:
Compare real Egyptian financial products.

CTA:
Explore Products

Icon style consistent with current iconography.

2️⃣ Marketplace Home Screen
Header

Title: Marketplace
Subtext: Compare. Learn. Choose Smart.

Persistent elements:

Coin counter (top right)

Filter icon

Search bar

Category Grid (Scrollable)

Use rounded card tiles with icons.

Categories:

Bank Accounts

Credit Cards

Loans

Investment Products

Insurance

Mobile Wallets

Fintech Apps

Each tile:

Icon

Short description

“Compare” button

Keep same card radius and shadow as simulation cards.

3️⃣ Product Listing Screen

Example: Credit Cards

Top Section:

Smart Filter Bar

Age

Income

Credit Score

Purpose

Filter button opens bottom sheet modal.

Product Cards (Scrollable)

Each product card contains:

Bank logo

Product name

Key highlight (APR %, Interest %, Fee)

Risk indicator badge

“View Details” button

“Compare” toggle checkbox

Color coding:

Green = strong offer

Yellow = moderate

Red = high cost

Maintain gamified style but professional tone.

4️⃣ Side-by-Side Comparison Screen

Allow comparison of up to 5 products.

Table-style layout but mobile-friendly stacked design.

Sections:

Interest Rate / APR

Annual Fees

Minimum Balance

Eligibility

Benefits

Watch Out For

Best For

Use:

Green check icons
Red warning icons
Expandable rows

Add “Best Value” badge for highest score.

5️⃣ Product Detail Screen
Layout Structure:

Header:

Bank logo

Product name

Rating stars

Sections:

Overview

Pros & Cons

Fees Breakdown

Eligibility Requirements

Educational Tooltip Section

User Reviews

Approval Odds Calculator

Apply Button

Eligibility Checker Widget

Inputs:

Age

Monthly Income

Existing Debt

Credit Score

Output:

Approval probability %

Missing requirements highlighted

Add:
Progress circle visual indicator.

6️⃣ Loan Calculator Screen

Interactive sliders:

Loan Amount

Interest Rate

Term

Outputs:

Monthly installment

Total paid

Total interest

Affordability check (≤40% income)

Add risk warning animation if over-leveraged.

7️⃣ Marketplace Gamification Layer

Add coins earning triggers:

Compare 10 products

First application

Referral application

Add badge:
“Product Explorer”

Add mini-progress tracker at top:
Marketplace Level

8️⃣ Application Tracking Screen

Flow state tracker:

Submitted → Reviewed → Approved / Rejected

If rejected:
Show:
Alternative products suggestions.

Use same progress step UI used in Business Simulation journey.

9️⃣ Reviews Section

Each review card:

User avatar

Rating

Comment

“Helpful” button

Coins reward indicator

Sort by:

Most Helpful

Newest

Highest Rated

🔟 Smart Personalization

Marketplace feed adapts based on:

Simulation activity

Budget behavior

Age segment

Risk tolerance

Add “Recommended For You” section at top.

UI REQUIREMENTS

Maintain:

Same card system

Same button style

Same rounded corners

Same grid spacing

Same font scale

Same shadows

Same navigation structure

Add new tab in bottom navigation if needed:
Marketplace

Micro-Interactions to Include

Compare toggle animation

Approval probability loading animation

Coin reward popups

Success modal after application