# Modern Chat Layout - Implementation Documentation

## 📋 Overview
This document describes the Modern Chat Layout feature implementation in the Mattermost Mobile app. The feature allows users to toggle between traditional and modern chat layouts, where modern layout displays the current user's own messages on the right side.

---

## 🏗️ Complete Chat Page Architecture

### Visual Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    CHANNEL SCREEN                           │
│                    (Main Chat Page)                         │
│                    app/screens/channel/                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                CHANNEL HEADER                      │    │
│  │                (ChannelHeader Component)           │    │
│  │                app/screens/channel/header/          │    │
│  │                                                     │    │
│  │  • Channel Title & Info                            │    │
│  │  • Member Count & Status                           │    │
│  │  • Channel Actions (Info, Search, etc.)            │    │
│  │  • Bookmarks (if enabled)                          │    │
│  │  • Channel Banner (if applicable)                  │    │
│  │                                                     │    │
│  │  ✅ NO CHANGES IN THIS COMPONENT                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 POST LIST AREA                      │    │
│  │                 (ChannelPostList Component)         │    │
│  │                 app/screens/channel/channel_post_list/│    │
│  │                                                     │    │
│  │  • Manages list of posts                           │    │
│  │  • Handles pagination                              │    │
│  │  • Passes isModernChatEnabled prop                 │    │
│  │                                                     │    │
│  │  ✅ NO CHANGES IN THIS COMPONENT                   │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────────┐ │    │
│  │  │            POST LIST                          │ │    │
│  │  │            (PostList Component)               │ │    │
│  │  │            app/components/post_list/          │ │    │
│  │  │                                                 │ │    │
│  │  │  • Scrollable FlatList                        │ │    │
│  │  │  • Renders post components                    │ │    │
│  │  │  • Manages date separators                    │ │    │
│  │  │  • Handles new message indicators              │ │    │
│  │  │                                                 │ │    │
│  │  │  ✅ NO CHANGES IN THIS COMPONENT               │ │    │
│  │  │                                                 │ │    │
│  │  │  ┌─────────────────────────────────────────────┐ │ │    │
│  │  │  │         INDIVIDUAL POST                   │ │ │    │
│  │  │  │         (Post Component)                  │ │ │    │
│  │  │  │         app/components/post_list/post/    │ │ │    │
│  │  │  │                                             │ │ │    │
│  │  │  │  🔄 THIS IS WHERE CHANGES WILL BE MADE    │ │ │    │
│  │  │  │                                             │ │ │    │
│  │  │  │  ┌─────────────────────────────────────────┐ │ │ │    │
│  │  │  │  │        POST STRUCTURE                  │ │ │ │    │
│  │  │  │  │  (Horizontal Layout: Avatar + Content) │ │ │ │    │
│  │  │  │  │                                         │ │ │ │    │
│  │  │  │  │  Traditional Layout:                   │ │ │ │    │
│  │  │  │  │  ┌─────────────┐  ┌────────────────────┐ │ │ │ │    │
│  │  │  │  │  │   AVATAR    │  │       CONTENT      │ │ │ │ │    │
│  │  │  │  │  │  (on left)  │  │    (on right)     │ │ │ │ │    │
│  │  │  │  │  └─────────────┘  └────────────────────┘ │ │ │ │    │
│  │  │  │  │                                         │ │ │ │    │
│  │  │  │  │  Modern Layout (YOUR messages):         │ │ │ │    │
│  │  │  │  │  ┌────────────────────┐  ┌─────────────┐ │ │ │ │    │
│  │  │  │  │  │       CONTENT      │  │   AVATAR    │ │ │ │ │    │
│  │  │  │  │  │     (on left)      │  │  (on right) │ │ │ │ │    │
│  │  │  │  │  └────────────────────┘  └─────────────┘ │ │ │ │    │
│  │  │  │  └─────────────────────────────────────────────┘ │ │ │    │
│  │  │  └───────────────────────────────────────────────────┘ │ │    │
│  │  └─────────────────────────────────────────────────────────┘ │    │
│  │                                                              │    │
│  │  ┌──────────────────────────────────────────────────────────┐ │    │
│  │  │                  POST DRAFT                            │ │    │
│  │  │                  (PostDraft Component)                 │ │    │
│  │  │                  app/components/post_draft/            │ │    │
│  │  │                                                          │ │    │
│  │  │  • Text Input Field                                     │ │    │
│  │  │  • Send Button                                          │ │    │
│  │  │  • Attachment Options                                   │ │    │
│  │  │  • Formatting Tools                                     │ │    │
│  │  │                                                          │ │    │
│  │  │  ✅ NO CHANGES IN THIS COMPONENT                       │ │    │
│  │  └──────────────────────────────────────────────────────────┘ │    │
│  └───────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              FLOATING COMPONENTS                           │    │
│  │                                                             │    │
│  │  • FloatingCallContainer (calls)                           │    │
│  │  • ScheduledPostIndicator (scheduled posts)                 │    │
│  │  • ScrollToEndView (jump to bottom)                        │    │
│  │                                                             │    │
│  │  ✅ NO CHANGES IN THIS COMPONENT                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Hierarchy

### Complete Flow
```
1. Channel Screen (app/screens/channel/)
   │
   ├─── Channel Header (app/screens/channel/header/)
   │    └─── NO CHANGES
   │
   ├─── Channel Post List (app/screens/channel/channel_post_list/)
   │    └─── NO CHANGES (Data flow only)
   │         │
   │         └─── Post List (app/components/post_list/)
   │              └─── NO CHANGES (List management only)
   │                   │
   │                   └─── Individual Post (app/components/post_list/post/)
   │                        └─── 🎯 CHANGES HERE (Conditional Rendering)
   │
   ├─── Post Draft (app/components/post_draft/)
   │    └─── NO CHANGES
   │
   └─── Floating Components
        └─── NO CHANGES
```

---

## 🔄 Data Flow for Modern Chat Layout

### Settings to UI Flow
```
┌──────────────────────┐
│   SETTINGS PAGE      │
│   (User Toggles)     │
│                      │
│  • Settings Config   │
│  • Toggle Switch     │
│  • Save Preference   │
└──────────────────────┘
         │
         ▼ (savePreference)
┌──────────────────────┐
│      DATABASE        │
│                      │
│  MODERN_CHAT_LAYOUT  │
│  category: display_  │
│  settings            │
│  name: modern_chat_  │
│  layout              │
│  value: "true"/"false│
└──────────────────────┘
         │
         ▼ (queryDisplayNamePreferences)
┌──────────────────────┐
│  CHANNEL POST LIST   │
│  (Observer)          │
│                      │
│  isModernChatEnabled:│
│  Observable<boolean> │
└──────────────────────┘
         │
         ▼ (Props: isModernChatEnabled)
┌──────────────────────┐
│      POST LIST       │
│                      │
│  • Receives prop     │
│  • Passes to Post    │
└──────────────────────┘
         │
         ▼ (Props: isModernChatEnabled)
┌──────────────────────┐
│   INDIVIDUAL POST    │
│                      │
│  • Gets isModernChat  │
│    Enabled prop      │
│  • Has currentUser.id│
│  • Has post.userId   │
│  • Applies conditional│
│    styling           │
└──────────────────────┘
```

---

## 📁 Modified Files

### 1. Settings Files (Already Implemented)
- ✅ `app/constants/preferences.ts`
  - Added: `MODERN_CHAT_LAYOUT: 'modern_chat_layout'`

- ✅ `app/screens/settings/config.ts`
  - Added: `modern_chat` config with icon and i18n

- ✅ `app/screens/settings/display/index.tsx`
  - Added: Observer for `isModernChatEnabled`
  - Added: Toggle logic in `goToModernChatSettings`

### 2. Channel Post List (Already Implemented)
- ✅ `app/screens/channel/channel_post_list/index.ts`
  - Added: Import `getDisplayNamePreferenceAsBool`
  - Added: Import `queryDisplayNamePreferences`
  - Added: Observer for `isModernChatEnabled`

- ✅ `app/screens/channel/channel_post_list/channel_post_list.tsx`
  - Added: `isModernChatEnabled` to Props type
  - Added: Prop in component destructuring
  - Added: Passed prop to `PostList` component

### 3. Post List (Already Implemented)
- ✅ `app/components/post_list/post_list.tsx`
  - Added: `isModernChatEnabled` to Props type
  - Added: Prop in component destructuring
  - Added: Passed to `Post` component in renderItem

### 4. Individual Post (Ready for Implementation)
- ✅ `app/components/post_list/post/post.tsx`
  - Added: `isModernChatEnabled: boolean` to PostProps type
  - Added: Prop in component destructuring
  - 🔄 **READY for conditional rendering implementation**

---

## 🎯 Implementation Plan

### What Will Be Modified

#### File: `app/components/post_list/post/post.tsx`

**Current State:**
- Component receives `isModernChatEnabled` prop
- Has access to `currentUser?.id` and `post.userId`
- Ready to implement conditional rendering

**What to Add:**
1. Logic to determine if current user owns the post
2. Logic to determine if modern layout should be applied
3. Conditional styles for modern vs traditional layout
4. Conditional rendering for avatar position
5. Conditional rendering for content alignment

**Approach:**
- Add new style objects for modern layout
- Use conditional logic: `isModernChatEnabled && isOwnMessage`
- Apply different styles/margins based on layout mode
- Keep all existing functionality intact

---

## 🔧 Technical Details

### Props Available in Post Component

```typescript
type PostProps = {
  // ... existing props
  isModernChatEnabled: boolean;  // ✅ New prop
  currentUser?: UserModel;        // For ownership check
  // ... other props
};

// In the component:
const isOwnMessage = post.userId === currentUser?.id;
const isModernLayout = isModernChatEnabled && isOwnMessage;
```

### Key Variables
- `isModernChatEnabled` - Boolean from settings
- `currentUser?.id` - Current logged-in user ID
- `post.userId` - The author of the post
- `isOwnMessage` - True if post author is current user
- `isModernLayout` - True when modern layout applies

---

## 📝 Current Status

### ✅ Completed
- [x] Settings page integration
- [x] Database preference storage
- [x] Observer pattern implementation
- [x] Props flow through components
- [x] Post component prop setup

### 🔄 In Progress
- [ ] Conditional rendering logic
- [ ] Modern layout styles
- [ ] Testing

### ⏳ Pending
- [ ] User acceptance testing
- [ ] Edge case handling
- [ ] Performance verification

---

## 🎨 Design Requirements

### Traditional Layout
- All messages appear on the LEFT
- Avatar on LEFT
- Content on RIGHT of avatar
- Standard margins and spacing

### Modern Layout
- Current user's messages appear on the RIGHT
- Avatar on RIGHT
- Content on LEFT of avatar
- Reversed margins and spacing
- Other users' messages stay on LEFT

---

## ❓ Questions to Consider

1. **Visual Changes:**
   - Which specific styles need to change?
   - Should colors change based on layout?
   - Any background color differences?

2. **Layout Direction:**
   - Reverse entire post layout?
   - Just adjust avatar position?
   - Content alignment changes?

3. **Ownership Check:**
   - Only apply to own messages?
   - Or all messages when setting is ON?

4. **Animation:**
   - Instant transition?
   - Or smooth animation?

---

## 💡 Recommended Approaches

### Option 1: Style-Based (Simple)
```typescript
const containerStyle = isModernLayout 
  ? styles.modernContainer 
  : styles.traditionalContainer;
```

### Option 2: Inline Conditional
```typescript
<View style={[styles.container, isModernLayout && styles.modernContainer]}>
  {/* content */}
</View>
```

### Option 3: Separate Components
```typescript
return isModernLayout 
  ? <ModernPost {...props} /> 
  : <TraditionalPost {...props} />;
```

---

## 📋 Next Steps

1. ✅ Documentation created
2. ⏳ Wait for implementation approval
3. ⏳ Implement conditional rendering
4. ⏳ Add modern layout styles
5. ⏳ Test functionality
6. ⏳ Review and refine

---

## 🚨 Important Notes

- **NO changes** to existing functionality
- **NO changes** to other components
- **ONLY** conditional styling in Post component
- Keep all existing data flow intact
- Maintain backward compatibility

---

**Document Created:** $(date)
**Status:** Ready for Implementation
**Approval Required:** Yes
