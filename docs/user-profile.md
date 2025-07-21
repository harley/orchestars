# User Profile Feature

This document describes the user profile feature implementation for the Orchestars platform.

## 1. Product Requirements Document (PRD)

### 1.1. Overview

The **User Profile** feature provides users with a comprehensive view and management of their account, membership status, and activity history. It is designed to be user-friendly, visually appealing, and fully internationalized (i18n).

### 1.2. Goals

* **Transparency:** Give users clear insight into their membership tier, points, and rewards.
* **Engagement:** Encourage users to participate more by showcasing progress and available rewards.
* **Personalization:** Display user-specific data such as join date, tier, and activity.
* **Internationalization:** Ensure all text and labels are easily translatable for global audiences.
* **Extensibility:** Allow for easy addition of new profile features in the future.

### 1.3 User Stories

* **As a User, I want to:**
    * See my name, membership tier, and when I joined.
    * Track my current points and how many more I need to reach the next tier.
    * View a visual progress bar for my membership journey.
    * Browse my reward-earning history and see details for each entry.
    * See a gallery of rewards I have claimed, including images and expiration dates.
    * Experience the profile in my preferred language.

### 1.4. Functional Requirements

* **Profile Overview:**
    * Display user's name, membership tier (with badge), and join date.
    * Show current points and points needed for the next tier.
    * Animated counter for points.
* **Progress Visualization:**
    * Progress bar with color-coded tiers and i18n labels.
    * "Points to next rank" indicator.
* **Rewards & History:**
    * Timeline of reward-earning activities (purchases, bonuses) with icons, dates, and i18n labels.
    * Visual gallery of claimed rewards, with images, types, and expiration dates.
* **Internationalization:**
    * All user-facing text uses translation keys and the `useTranslate` hook.
    * Supports multiple languages via JSON locale files.
* **Error & Loading States:**
    * Show loading spinner while fetching data.
    * Display user-friendly, translated error messages on failure.

---

## 2. Implementation Details

### 2.1. Frontend

#### 2.1.1. Core Components

* **`src/components/User/Profile/index.tsx`**
    * Main profile component. Renders all profile sections and handles layout.
* **`src/components/User/Profile/ProgressBar.tsx`**
    * Animated progress bar with i18n labels and tier color coding.
* **`src/components/User/Profile/OrderHistory.tsx`**
    * Timeline of reward-earning activities, with icons, and dates.
* **`src/components/User/Profile/RewardsGallery.tsx`**
    * Visual gallery of claimed rewards, including images, types, and expiration dates.
* **`src/components/User/hooks/useUserProfile.ts`**
    * Custom hook for fetching and caching user profile data.

#### 2.1.2. Internationalization

* All text uses the `useTranslate` hook and translation keys.
* Locale files are stored in `src/payload-config/i18n/locales/`.

#### 2.1.3. Error & Loading Handling

* Shows a spinner and disables UI while loading.
* Displays translated error messages if data fails to load.

### 2.2. Backend

* **API Endpoints:**
    * `/api/user/membership-point` — Fetches user's current points and tier.
    * `/api/user/reward-timeline` — Fetches user's reward-earning history.
    * `/api/user/membership-gifts` — Fetches user's claimed rewards.
* **Data Model:**
    * Membership points, tiers, rewards, and histories are stored in dedicated collections.
    * All endpoints return data in a format ready for display and i18n.

---

## 3. Current Status

**Status: `Phase 1 Complete`**

The user profile feature is live and fully functional.

### 3.1. Completed Features

- **Profile Overview:** Displays user name, tier, and join date.
- **Points & Progress:** Animated counter, points to next rank, and progress bar.
- **Rewards Timeline:** Timeline of reward-earning activities with icons and i18n.
- **Rewards Gallery:** Visual gallery of claimed rewards with images and expiration dates.
- **Internationalization:** All text and labels are translatable.
- **Error & Loading States:** User-friendly and fully translated.
- **Extensible Design:** Modular components for easy future enhancements.

---

## 4. Future Roadmap

### 4.1. Immediate Next Steps

* **Editable Profile Fields:**
    * Allow users to update their personal information (name, avatar, etc.).

### 4.2. Backlog & Potential Improvements

* **Push Notifications:** Notify users when they reach a new tier or earn a reward.