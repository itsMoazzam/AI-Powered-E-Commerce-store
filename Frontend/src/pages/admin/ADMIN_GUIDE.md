# Admin Dashboard - Complete Implementation Guide

## Overview
The admin dashboard has been completely implemented with full management capabilities for users, sellers, system payments, reviews, and system configuration.

## Features Implemented

### 1. **Users Tab** ✅
**View & Manage Customers**

Features:
- View all registered customers in a table with:
  - Username, Email, Full Name
  - Account Status (Active/Inactive/Blocked)
  - Join Date
  - Last Login

**Actions per User:**
- **Edit** (✏️ icon) - Opens modal to edit username, email, name, and active status
- **Block** (🔒 icon) - Blocks user account with optional reason
  - Once blocked, user cannot login
  - Shows "Blocked" status
  - Can be unblocked with Unlock (🔓) icon
- **Delete** (🗑️ icon) - Permanently deletes user and all their data
  - Requires confirmation dialog

**User Edit Modal:**
- Edit username, email, first name, last name
- Toggle active/inactive status
- Save changes via API PUT `/api/admin/users/{id}/`

**Blocking System:**
- Modal prompts for reason (optional)
- Sets `is_blocked: true` on user
- Prevents account access
- Reversible via unblock action

---

### 2. **Sellers Tab** ✅
**View & Manage Sellers**

Features:
- View all seller accounts in a table with:
  - Username, Business Name
  - Rating (with ⭐ indicator)
  - Status (Active/Inactive/Blocked)
  - Approval Status (Pending/Approved badges)
  - Suspension Status badge (if suspended)
  - Join Date

**Actions per Seller:**
- **Edit** (✏️ icon) - Opens modal to edit seller profile
- **Approve** (✔️ icon) - Approve pending seller registration
  - Only shows if `approved: false`
  - Sets `approved: true` via API
- **Block** (🔒 icon) / **Unblock** (🔓 icon) - Block/unblock seller account
  - Works same as user blocking with reason prompt
  - Prevents seller from accessing dashboard
- **Suspend** (👁️‍🗨️ off icon) / **Unsuspend** (👁️ icon) - Temporarily suspend/reactivate seller
  - Separate from blocking (can be active but suspended)
  - Useful for policy violations
- **Delete** (🗑️ icon) - Permanently delete seller and all products/orders

**Seller Edit Modal:**
- Edit username, business name, email, first name, last name
- Toggle active/inactive status
- Save via API PUT `/api/admin/sellers/{id}/`

**Multi-Status Display:**
- Shows multiple status badges simultaneously:
  - Active/Inactive/Blocked status
  - Pending Approval badge (if not approved)
  - Suspended badge (if suspended)

---

### 3. **Settings Tab** ✅
**System Configuration Management**

**Configuration Cards (Display Mode):**
- **Maintenance Mode** 🔴/🟢
  - Shows enabled/disabled status with red/green indicator
  - When enabled, system shows maintenance page
- **Max Upload Size** 📦
  - File size limit in MB
  - Applied to all file uploads
- **Commission Rate** 💰
  - Percentage commission on seller transactions
  - Typically 5-10%
- **Minimum Withdrawal** 💳
  - Minimum amount seller can withdraw
  - Prevents too many small payouts
- **Email Notifications** ✉️
  - Enable/disable email notifications
  - Affects order, review, payment notifications
- **SMS Notifications** 📱
  - Enable/disable SMS notifications
  - Affects critical alerts

**Edit Configuration Modal:**
- Adjustable inputs for numeric values:
  - Commission Rate: 0-100% with 0.1 increments
  - Max Upload Size: 1-1000 MB
  - Minimum Withdrawal: 0-unlimited $
- Toggle checkboxes for:
  - Maintenance Mode
  - Email Notifications
  - SMS Notifications
- Save all settings via API PUT `/api/admin/config/`

---

## API Endpoints Required

### User Management
```
GET    /api/admin/users/           - List all users
PUT    /api/admin/users/{id}/      - Update user profile
POST   /api/admin/users/{id}/block/   - Block user (body: {reason})
POST   /api/admin/users/{id}/unblock/ - Unblock user
DELETE /api/admin/users/{id}/      - Delete user permanently
```

### Seller Management
```
GET    /api/admin/sellers/         - List all sellers
PUT    /api/admin/sellers/{id}/    - Update seller profile
POST   /api/admin/sellers/{id}/approve/   - Approve seller
POST   /api/admin/sellers/{id}/block/     - Block seller (body: {reason})
POST   /api/admin/sellers/{id}/unblock/   - Unblock seller
POST   /api/admin/sellers/{id}/suspend/   - Suspend seller
POST   /api/admin/sellers/{id}/unsuspend/ - Unsuspend seller
DELETE /api/admin/sellers/{id}/    - Delete seller permanently
```

### System Configuration
```
GET    /api/admin/config/          - Get current config
PUT    /api/admin/config/          - Update config
```

---

## Data Models

### User Type
```typescript
type User = {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    is_active: boolean
    is_blocked: boolean
    role: string
    created_at: string
    last_login: string
}
```

### Seller Type
```typescript
type Seller = {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    business_name: string
    is_active: boolean
    is_blocked: boolean
    approved: boolean
    suspended: boolean
    created_at: string
    rating: number
}
```

### SystemConfig Type
```typescript
type SystemConfig = {
    maintenance_mode: boolean
    max_upload_size: number        // MB
    commission_rate: number        // %
    minimum_withdrawal: number     // $
    email_notifications_enabled: boolean
    sms_notifications_enabled: boolean
}
```

---

## UI/UX Features

### Status Badges
- **Active**: Green background, checkmark icon ✔️
- **Inactive**: Yellow background, alert icon ⚠️
- **Blocked**: Red background, X circle icon ❌
- **Pending Approval**: Yellow pill with alert icon
- **Suspended**: Red pill with X icon

### Action Buttons
All action buttons are icon-only (hover shows tooltip):
- Edit (✏️) - Blue
- Block (🔒) - Orange
- Unblock (🔓) - Green
- Approve (✔️) - Green
- Suspend (👁️‍🗨️ off) - Yellow
- Unsuspend (👁️) - Blue
- Delete (🗑️) - Red

### Modals
**Block Modal:**
- Warning message specific to user/seller
- Optional reason textarea
- Cancel/Block buttons

**Edit Modal:**
- Form with pre-filled data
- Responsive grid layout
- Activity status checkbox
- Cancel/Save buttons

**Settings Modal:**
- Numeric inputs with min/max constraints
- Toggle checkboxes
- Cancel/Save buttons

### Mobile Responsiveness
- Fixed header on mobile with hamburger menu
- Sidebar collapses on mobile
- Table scrolls horizontally on smaller screens
- All modals are responsive with proper padding

---

## State Management

### Modal States
```typescript
const [showEditUserModal, setShowEditUserModal] = useState(false)
const [showEditSellerModal, setShowEditSellerModal] = useState(false)
const [showSettingsModal, setShowSettingsModal] = useState(false)
const [showBlockModal, setShowBlockModal] = useState(false)
const [blockingUserId, setBlockingUserId] = useState<number | null>(null)
const [blockingType, setBlockingType] = useState<"user" | "seller" | null>(null)
const [blockReason, setBlockReason] = useState("")
```

### Processing Tracker
Uses `useRef<Set<number>>` to track which items are being processed to prevent double-clicks:
```typescript
const processingIds = useRef<Set<number>>(new Set())
```

---

## Error Handling

All API calls include try-catch with:
- User alert messages
- Console error logging
- Graceful fallback (data not updated if API fails)
- Processing flag cleanup in finally block

---

## Theme Integration

Uses theme context for:
- Primary color for buttons and highlights
- Dark mode support via theme toggle
- CSS custom properties for colors

---

## Next Steps for Backend Implementation

1. **Implement all user/seller/config API endpoints**
   - Add proper validation
   - Add authentication checks
   - Add audit logging for admin actions

2. **Add blocking/suspension logic**
   - Prevent blocked users from logging in
   - Prevent blocked sellers from accessing dashboard
   - Return 403 if they try to access endpoints

3. **Add approval workflow**
   - Email notification when seller approved
   - Email notification when seller blocked

4. **Add audit trail**
   - Log all admin actions (block, delete, edit, etc.)
   - Store reason for blocks
   - Track which admin performed action

5. **Add pagination**
   - Users/sellers lists may be large
   - Add offset/limit parameters
   - Add prev/next buttons

6. **Add search/filter**
   - Search by username, email
   - Filter by status (active/blocked/suspended)
   - Filter by role (admin/seller/customer)

---

## Existing Tabs (Already Implemented)

- **Dashboard**: Overview with stats and recent payments
- **Payments**: Payment verification with OCR and screenshot review
- **Reviews**: Toxicity and plagiarism detection on user reviews
- **System**: System health status (API, Database, etc.)
- **Reports**: Placeholder for future analytics

---

## File Location
`src/pages/admin/AdminPanel.tsx`

---

## Testing Checklist

- [ ] Load Users tab and verify table displays
- [ ] Click Edit on a user - modal opens with correct data
- [ ] Update user and save - verify API call
- [ ] Click Block on a user - blocking modal opens
- [ ] Enter block reason and confirm - user blocked
- [ ] Click Unblock - user unblocked
- [ ] Click Delete - confirmation dialog shows
- [ ] Load Sellers tab and verify table displays
- [ ] Test all seller actions (approve, block, suspend, etc.)
- [ ] Load Settings tab - verify config cards display
- [ ] Click Edit Configuration - modal opens with correct values
- [ ] Update settings and save - verify API call
- [ ] Test responsive design on mobile
- [ ] Verify theme toggle works
- [ ] Test dark/light mode
