# 🚀 FocusOS — Feature Overview

FocusOS is a modern productivity system designed for **deep work, task management, and focus-driven execution**. It combines task organization, Pomodoro-based focus, and behavioral insights into a single workflow.

---

## 🧠 Core Philosophy

* **Silence the noise. Reclaim your flow.**
* **Execution over clutter**
* **Context-aware UI**
* **Deep work first**
* **Minimal cognitive load**

---

# 🏗️ Core Features

---

## 🌐 Landing Page (FlowState)

A high-conversion, narrative-driven landing page designed to guide the visitor from chaos → clarity.

* **Glassmorphic Navbar** — Fixed with `backdrop-filter: blur(12px)`, scroll-responsive border
* **Auth Integration** — Log In / Sign Up trigger modal; no page redirect
* **Hero Section** — Storytelling headline: *"Silence the noise. Reclaim your flow."*
* **Chaos Dissolution Animation** — Ghost notification badges (Slack, Jira, email, calendar conflicts) drift across screen and dissolve during scroll — visually demonstrating the "cleansing" before Ghost UI activates
* **Ghost UI Scroll Sequence** — 400vh Apple-style sticky scroll:
  * Sidebar, header, tabs, and checklist slide off-screen in different directions
  * Title + timer remain centered and scale up
  * "You've entered the zone." immersive overlay
* **Problem Section** — *"Your tools are the ones drowning you."* — frames traditional apps as the antagonist
* **Feature Showcase** — Three-tab workspace: *Execute / Compose / Reflect*
* **Bento Feature Grid** — Auto-Drift, Energy Batching, Liquid Blocks, Velocity Learning
* **Momentum Scorecard** — *"Close your laptop with energy to spare."* — positions the app as a reward, not a burden
* **CTA Section** — *"Your focus is a finite resource. Protect it."*
* **Footer** — Anchor links to all on-page sections; no dead `#` hrefs

---

## 📌 Project & Task Management

* Create and manage **Projects**
* Organize tasks within projects (Kanban/List)
* Task features:

  * Title, description, notes
  * Subtasks
  * Tags & priorities
  * Due dates
  * Difficulty level
  * Categories
* Task completion with:

  * Auto-complete (based on Pomodoro estimate)
  * Archive support
  * Completion animations

---

## ⚡ Pomodoro Focus System

* Built-in **Pomodoro timer**
* Start focus session directly from a task
* Session tracking:

  * Completed sessions
  * Total focus time
* Active task highlighting
* Auto-update task progress on session completion

---

## 🍅 Pomodoro Estimation

* Set **estimated Pomodoros per task**
* Track **completed Pomodoros**
* Visual progress bar on task
* Detect and highlight **overestimation / underestimation**

---

## 🧭 Contextual Task Workspace

Replaces traditional dashboard with a **3-mode task view**:

### 1. Execute (Execution Mode)

* Hero task + timer
* Centered subtasks ("Focus Rows")
* Minimal UI for zero distraction
* Ghost UI (fades after inactivity)

### 2. Compose (Composition Mode)

* Split-pane layout:

  * Notes (Markdown)
  * Attachments & metadata
* Contextual visibility (low-opacity metadata)

### 3. Reflect (Reflection Mode)

* Session analytics
* Timeline of focus sessions
* Unified session scorecard

---

## 🔥 Zenith Focus Mode

A full-screen deep work environment:

* Single **Hero Task**
* Minimal UI
* Ghosting logic (UI fades after 5s inactivity)
* Integrated timer
* Distraction Scratchpad:

  * Capture thoughts using `!` or `?`
  * Stored for later review

---

## 🧠 Deep Work Sessions

* Group multiple focus sessions into one workflow
* Continue / End flow between sessions
* Optional break handling
* Track:

  * Total time
  * Session count
  * Interruptions

---

## ⚡ Momentum Summary (Post-Focus)

After each deep work session:

* Session summary (time, sessions, interruptions)
* **Energy check-in** (Low / Medium / High)
* Distraction review:

  * Convert to tasks
  * Dismiss entries

---

## 📊 Analytics & Insights

* Focus time tracking
* Session history timeline
* Task-level statistics:

  * Total time spent
  * Average session duration
  * Estimation accuracy
* Project-level insights (planned)

---

## 📅 Calendar Planning

* Google Calendar–style interface
* Schedule tasks as events
* Drag & resize events
* Create tasks directly from calendar
* Start focus sessions from calendar
* Current time indicator (live)
* Zoom levels (hour → day → week)
* **Unallocated Tasks Sidebar** — drag & drop tasks from sidebar onto calendar
* **Tag-based filtering** — filter unallocated tasks by tag
* **Search bar** — search within unallocated tasks

---

## 🏷️ Organization Features

* Tags (multi-select)
* Categories (single classification)
* Difficulty levels (energy-based work planning)
* Filters:

  * By tag
  * By difficulty
  * By priority

---

## 🎧 Focus Music Integration

* Background work/study music via YouTube
* Hidden player with custom controls
* Features:

  * Play / Pause
  * Volume control
  * Playlist selection
* Auto-play on focus start
* Floating music widget
* User preference persistence

---

## 🧩 UI/UX System (FlowState DLS)

* **2-Second Capture** (command-style input)
* **Contextual Visibility** (low-opacity metadata)
* **Ghost UI** (fade inactive elements on inactivity)
* Minimalist, execution-focused design
* Fonts:

  * Inter (content)
  * JetBrains Mono (data/timer)

---

## 🏗️ Architecture

* Frontend: Next.js (Vercel)
* Database: PostgreSQL (Supabase)
* Storage: Cloudflare R2 (attachments)
* API: Serverless functions

---

## 🔐 Storage & Attachments

* File uploads (images, PDFs, docs)
* Secure storage using Cloudflare R2
* Structured file organization:

  ```
  userId / taskId / files
  ```
* Presigned URL support (secure, time-limited access)

---

## 🧠 Future Scope

* AI-based task prioritization
* Energy-based scheduling
* Smart focus recommendations
* Advanced analytics dashboard
* Recurring tasks & dependencies

---

# 🚀 Vision

FocusOS is not just a task manager.

It is a **complete system for thinking, focusing, and executing work at a high level** — where the UI itself becomes your guardian against distraction.