# TaskFlow Mobile – Approval & Task Management System

An Expo-based React Native mobile application built to streamline how managers receive, review, and act on requests. Features a dedicated admin drawer for assigning tasks, managing users, editing tasks, and monitoring overall stats, with role-based access control to separate manager and admin workflows.

## Features

* 📥 Task inbox with filtering and sorting
* 📋 Detailed task view with context-aware action buttons and dynamic routing
* ✅ Manage tasks with optional comments
* 🔔 Smart notifications with live unread count for new assignments, deadlines, and overdue items
* 📊 Dashboard summary showing pending, completed, overdue, and due-soon tasks with progress bar and priority breakdowns
* 🛡️ Admin drawer with pages for assigning tasks, editing tasks, managing users, and viewing overall system report
* 👥 User management with the ability to add new users and view details
* ✏️ Task editing with date picker and assignee selector
* 🔐 Role-based access control with navigation redirection based on auth state
* 💾 Session persistence via Async Storage with "Keep me signed in" option

## Screenshots

<details>
<summary>Click to view sample screenshots</summary>

### Manager Dashboard

<img src="./assets/screenshots/Simulator Screenshot - iPhone 17 Pro - 2026-06-06 at 21.31.19.png" alt="Manager Dashboard" width="300"/>

### Inbox

<img src="./assets/screenshots/Simulator Screenshot - iPhone 17 Pro - 2026-06-06 at 21.32.18.png" alt="Inbox" width="300"/>

### Manager Profile

<img src="./assets/screenshots/Simulator Screenshot - iPhone 17 Pro - 2026-06-06 at 21.33.25.png" alt="Manager Profile" width="300"/>

### Manager Task View

<img src="./assets/screenshots/Simulator Screenshot - iPhone 17 Pro - 2026-06-06 at 21.34.00.png" alt="Manager Task View" width="300"/>

### Admin Dashboard

<img src="./assets/screenshots/Simulator Screenshot - iPhone 17 Pro - 2026-06-06 at 21.35.09.png" alt="Admin Dashboard" width="300"/>

### Admin Report

<img src="./assets/screenshots/Simulator Screenshot - iPhone 17 Pro - 2026-06-06 at 21.35.22.png" alt="Admin Report" width="300"/>

### User Management

<img src="./assets/screenshots/Simulator Screenshot - iPhone 17 Pro - 2026-06-06 at 21.35.36.png" alt="User Management" width="300"/>

### Admin Task View

<img src="./assets/screenshots/Simulator Screenshot - iPhone 17 Pro - 2026-06-06 at 21.39.33.png" alt="Admin Task View" width="300"/>
</details>

## Tech Stack

* **React Native & Expo** – Multi-platform mobile app development framework
* **Expo Router** – File-based routing for React Native
* **Uniwind (Tailwind CSS)** – Utility-first styling for Native views
* **Expo Drawer** – Drawer-based navigation for admin and manager menus
* **JSON Server** – Local mock backend & REST API
* **Async Storage** – Local persistent key-value storage for authentication and configuration
* **React Native Modal Datetime Picker** – Date and time picker modal
* **Expo Symbols & Vector Icons** – Icon libraries for native UI components

## Installation

### Prerequisites

Make sure you have completed the [Expo – Environment Setup](https://docs.expo.dev/get-started/set-up-your-environment/) instructions.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Hardik0602/TaskFlow-Mobile
cd TaskFlow-Mobile
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Variables

Create a `.env` file in the root directory and configure the API URL:

```env
EXPO_PUBLIC_API_URL=http://LocalIP:3000
```
*(Replace `LocalIP` with your host computer's local network IP address, so physical devices/emulators can connect to the host).*

### Step 4: Start the Local Backend

```bash
npm run server
```

### Step 5: Start the Development Server

```bash
# Expo Go
npx expo

# Devices/Emulators
npx expo run:android
npx expo run:ios
```

## Dependencies

```json
{
  "@expo/vector-icons": "^15.0.3",
  "@react-native-async-storage/async-storage": "2.2.0",
  "@react-native-community/datetimepicker": "8.4.4",
  "@react-native-picker/picker": "2.11.1",
  "@react-navigation/drawer": "^7.9.11",
  "expo": "~54.0.33",
  "expo-dev-client": "~6.0.21",
  "expo-linear-gradient": "~15.0.8",
  "expo-router": "~6.0.23",
  "expo-status-bar": "~3.0.9",
  "json-server": "^1.0.0-beta.15",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-modal-datetime-picker": "^18.0.0",
  "react-native-reanimated": "~4.1.1",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0",
  "tailwindcss": "^4.2.4",
  "uniwind": "^1.6.3"
}
```

## Project Structure

```
TaskFlow-Mobile/
├── app/
│   ├── (admin)/             # Admin-only pages
│   │   ├── _layout.tsx
│   │   ├── adminDashboard.tsx
│   │   ├── adminProfile.tsx
│   │   ├── report.tsx
│   │   ├── tasks.tsx
│   │   └── userManagement.tsx
│   ├── (auth)/              # Authentication page
│   │   └── login.tsx
│   ├── (manager)/           # Manager-only pages
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── inbox.tsx
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── (pages)/             # Dynamic routes and other pages
│   │   ├── addUser.tsx
│   │   ├── task/
│   │   │   └── [taskId]/
│   │   │       ├── edit.tsx
│   │   │       └── index.tsx
│   │   └── user/
│   │       └── [userId].tsx
│   ├── components/          # Reusable mobile UI components
│   │   ├── AdminDrawerContent.tsx
│   │   ├── Comments.tsx
│   │   ├── FilterPicker.tsx
│   │   ├── ManagerDrawerContent.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StatCard.tsx
│   │   ├── TaskCard.tsx
│   │   └── UserList.tsx
│   ├── _layout.tsx          # Root router layout
│   └── index.tsx            # Main app entrance / redirector
├── constants/
│   └── api.ts               # Environment configurations & API endpoints
├── context/                 # Context providers
│   ├── AuthContext.tsx      # Authentication & login/logout
│   ├── FilterContext.tsx    # Filter and sort states for tasks
│   ├── NotificationContext.tsx # Notifications management
│   └── TaskContext.tsx      # Task CRUD operations and state
├── .env                     # Local environment variables
└── db.json                  # Mock database
```

## Key Features Implementation

### Authentication

* Session persistence using Async Storage (based on "Keep me signed in")
* Authentication guards redirecting unauthenticated users to `/login`
* Role-based screen layout protection (Admin/Manager drawers)
* Log out with full session clearance

### Task Inbox (Manager)

* Filter by category, status, and priority
* Sort by due date or priority
* Tasks listed with status tags and custom styling

### Task Detail & Actions

* Dynamic routes using task IDs (`/task/[taskId]`)
* Confirmation dialogs before submitting any action
* Comments section with per-task comments

### Notifications (Manager)

* Notifications view showing unread messages and tasks updates
* Mark individual or all notifications as read

### Admin Panel

* **Dashboard** - Summary cards for total tasks, pending, completed, and overdue counts
* **User Management** - Browse, search, and add new users
* **Task Assignment & Editing** - Edit description, priority, assignee, and due date of existing tasks
* **Reports** - System-wide stats and priority breakdowns

### UI / UX

* Mobile-responsive layout powered by Tailwind CSS (`uniwind`)
* Native loading activity indicators
* Elegant modals and interactive forms

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Manager | `john.doe@company.com` | `password123` |
| Manager | `jane.smith@company.com` | `password123` |
| Admin | `admin@company.com` | `password123` |
| Admin | `adminJr@company.com` | `password123` |

<!-- https://stackoverflow.com/questions/79643891/keyboardavoidingview-issue-on-android -->