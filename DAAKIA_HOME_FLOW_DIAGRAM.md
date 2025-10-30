# DaakiaHome User Flow Diagrams

## 🔄 Current (Broken) Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LOGS IN                              │
│                        (e.g., act2)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    launchApp() called                            │
│              (app/init/launch.ts line 79)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────┴──────────────┐
          │   Has server credentials?   │
          └──────────────┬──────────────┘
                         │ YES
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               launchToHome() called                              │
│              (app/init/launch.ts line 172)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         appEntry() called BEFORE team check                      │
│         - Opens WebSocket                                        │
│         - Starts data sync                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            Query teams from database                             │
│            nTeams = queryMyTeams(db).fetchCount()                │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │   nTeams > 0?               │
          │   (❌ BUG: Database not     │
          │   cleared on logout,        │
          │   returns act1's teams!)    │
          └──────────────┬──────────────┘
                         │ YES (WRONG!)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              resetToHome() called                                │
│              Sets root to HOME screen                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            HomeScreen loads (app/screens/home)                   │
│            Tab Navigator with HomeDaakia as first tab            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         HomeDaakia loads and renders                             │
│         ❌ Shows act1's old chats (database not cleared!)        │
│         ❌ No team validation in component                       │
│         ❌ Should have redirected to Join Team                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Fixed Flow (After Implementation)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LOGS IN                              │
│                        (e.g., act2)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    launchApp() called                            │
│              (app/init/launch.ts line 79)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────┴──────────────┐
          │   Has server credentials?   │
          └──────────────┬──────────────┘
                         │ YES
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               launchToHome() called                              │
│              (app/init/launch.ts line 172)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│       ✅ Query teams from database FIRST                         │
│            nTeams = queryMyTeams(db).fetchCount()                │
│            (Database was properly cleared on logout)             │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │   nTeams > 0?               │
          └──────────────┬──────────────┘
                         │ NO (CORRECT!)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│        ✅ resetToTeams() called immediately                      │
│           Sets root to SELECT_TEAM screen                        │
│           Does NOT call appEntry()                               │
│           Does NOT open WebSocket                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          SelectTeam screen loads                                 │
│          Shows available teams or "No Teams" message             │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │   User joins a team         │
          └──────────────┬──────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│     Team membership added to database                            │
│     SelectTeam detects nTeams > 0 (via observable)               │
│     Automatically calls resetToHome()                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            HomeScreen loads with HomeDaakia                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         ✅ HomeDaakia validates nTeams > 0                       │
│         ✅ Shows fresh channels for this user                    │
│         ✅ No old data from previous user                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Logout Flow Comparison

### Current (Broken) Logout

```
┌─────────────────────────────────────────────────────────────────┐
│                  User clicks Logout                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         daakiaLogout() called                                    │
│         (app/actions/remote/daakia_logout.ts)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│    ✅ NetworkManager.invalidateClient(serverUrl)                │
│    ✅ WebsocketManager.invalidateClient(serverUrl)              │
│    ✅ SecurityManager.removeServer(serverUrl)                   │
│    ✅ removeServerCredentials(serverUrl)                        │
│    ✅ PushNotifications.removeServerNotifications(serverUrl)    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│    ❌ DatabaseManager.deleteServerDatabase() NOT CALLED!        │
│    ❌ All team/channel/post data remains in database!           │
│    ❌ MY_TEAM table still has old user's teams!                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              relaunchApp() called                                │
│              App restarts                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│    Login screen shows                                            │
│    User logs in with different account (act2)                    │
│    ❌ Database still contains act1's data!                      │
└─────────────────────────────────────────────────────────────────┘
```

### Fixed Logout

```
┌─────────────────────────────────────────────────────────────────┐
│                  User clicks Logout                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         daakiaLogout() called                                    │
│         (app/actions/remote/daakia_logout.ts)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│    ✅ NetworkManager.invalidateClient(serverUrl)                │
│    ✅ WebsocketManager.invalidateClient(serverUrl)              │
│    ✅ SecurityManager.removeServer(serverUrl)                   │
│    ✅ removeServerCredentials(serverUrl)                        │
│    ✅ PushNotifications.removeServerNotifications(serverUrl)    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│    ✅ DatabaseManager.deleteServerDatabase(serverUrl)           │
│    ✅ Clears all tables (MY_TEAM, CHANNEL, POST, etc.)          │
│    ✅ Removes all user-specific data                            │
│    ✅ Image.clearDiskCache()                                    │
│    ✅ deleteFileCache() for cached files                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              relaunchApp() called                                │
│              App restarts with clean state                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│    Login screen shows                                            │
│    User logs in with different account (act2)                    │
│    ✅ Database is fresh and empty                               │
│    ✅ Only act2's data will be loaded                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database State Comparison

### Before Fix (Session Mix-up)

```
┌──────────────────────────────────────────────────────────────────┐
│                    LOGIN: act1 (has teams)                       │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
         ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ┃   Database (serverUrl)         ┃
         ┃                                ┃
         ┃   MY_TEAM:                     ┃
         ┃   ├─ team1 (act1)              ┃
         ┃   └─ team2 (act1)              ┃
         ┃                                ┃
         ┃   CHANNEL:                     ┃
         ┃   ├─ channel1 (team1)          ┃
         ┃   ├─ channel2 (team1)          ┃
         ┃   └─ channel3 (team2)          ┃
         ┃                                ┃
         ┃   POST:                        ┃
         ┃   ├─ 100 posts                 ┃
         ┃                                ┃
         ┃   CURRENT_USER_ID: act1        ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌──────────────────────────────────────────────────────────────────┐
│                    LOGOUT act1                                   │
│         ❌ daakiaLogout() does NOT clear database               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
         ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ┃   Database (serverUrl)         ┃
         ┃                                ┃
         ┃   ❌ MY_TEAM: (STILL EXISTS!)  ┃
         ┃   ├─ team1 (act1)              ┃
         ┃   └─ team2 (act1)              ┃
         ┃                                ┃
         ┃   ❌ CHANNEL: (STILL EXISTS!)  ┃
         ┃   ├─ channel1 (team1)          ┃
         ┃   ├─ channel2 (team1)          ┃
         ┃   └─ channel3 (team2)          ┃
         ┃                                ┃
         ┃   ❌ POST: (STILL EXISTS!)     ┃
         ┃   ├─ 100 posts                 ┃
         ┃                                ┃
         ┃   CURRENT_USER_ID: act1        ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌──────────────────────────────────────────────────────────────────┐
│              LOGIN: act2 (supposed to have NO teams)             │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
         ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ┃   Database (serverUrl)         ┃
         ┃                                ┃
         ┃   ❌ MY_TEAM: (act1's teams!)  ┃
         ┃   ├─ team1                     ┃
         ┃   └─ team2                     ┃
         ┃                                ┃
         ┃   ❌ CHANNEL: (act1's chats!)  ┃
         ┃   ├─ channel1                  ┃
         ┃   ├─ channel2                  ┃
         ┃   └─ channel3                  ┃
         ┃                                ┃
         ┃   ❌ POST: (act1's messages!)  ┃
         ┃   ├─ 100 posts                 ┃
         ┃                                ┃
         ┃   ✅ CURRENT_USER_ID: act2     ┃
         ┃      (updated on login)        ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                         │
                         ▼
         ❌ queryMyTeams().count() = 2 (WRONG!)
         ❌ App thinks act2 has teams
         ❌ Shows HomeDaakia with act1's old data
```

### After Fix (Clean Sessions)

```
┌──────────────────────────────────────────────────────────────────┐
│                    LOGIN: act1 (has teams)                       │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
         ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ┃   Database (serverUrl)         ┃
         ┃                                ┃
         ┃   MY_TEAM:                     ┃
         ┃   ├─ team1 (act1)              ┃
         ┃   └─ team2 (act1)              ┃
         ┃                                ┃
         ┃   CHANNEL:                     ┃
         ┃   ├─ channel1 (team1)          ┃
         ┃   ├─ channel2 (team1)          ┃
         ┃   └─ channel3 (team2)          ┃
         ┃                                ┃
         ┃   POST:                        ┃
         ┃   ├─ 100 posts                 ┃
         ┃                                ┃
         ┃   CURRENT_USER_ID: act1        ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌──────────────────────────────────────────────────────────────────┐
│                    LOGOUT act1                                   │
│    ✅ daakiaLogout() calls deleteServerDatabase()               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
         ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ┃   Database (CLEARED)           ┃
         ┃                                ┃
         ┃   ✅ MY_TEAM: (empty)          ┃
         ┃   ✅ CHANNEL: (empty)          ┃
         ┃   ✅ POST: (empty)             ┃
         ┃   ✅ CURRENT_USER_ID: (empty)  ┃
         ┃   ✅ All tables cleared        ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌──────────────────────────────────────────────────────────────────┐
│              LOGIN: act2 (has NO teams)                          │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
         ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ┃   Database (serverUrl)         ┃
         ┃                                ┃
         ┃   ✅ MY_TEAM: (empty)          ┃
         ┃                                ┃
         ┃   ✅ CHANNEL: (empty)          ┃
         ┃                                ┃
         ┃   ✅ POST: (empty)             ┃
         ┃                                ┃
         ┃   ✅ CURRENT_USER_ID: act2     ┃
         ┃      (set on login)            ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                         │
                         ▼
         ✅ queryMyTeams().count() = 0 (CORRECT!)
         ✅ App detects no teams
         ✅ Shows SELECT_TEAM screen (Join Team)
```

---

## 🎯 Key Files & Their Roles

```
┌────────────────────────────────────────────────────────────────┐
│  FILE: app/init/launch.ts                                      │
│  ROLE: Main entry point, decides which screen to show          │
│  KEY FUNCTION: launchToHome()                                  │
│  ├─ Queries team count                                         │
│  ├─ Calls resetToHome() if user has teams                      │
│  └─ Calls resetToTeams() if user has NO teams                  │
└────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│  FILE: app/screens/navigation.ts                               │
│  ROLE: Navigation control, sets app root                       │
│  KEY FUNCTIONS:                                                │
│  ├─ resetToHome() → Sets root to HOME screen                   │
│  └─ resetToTeams() → Sets root to SELECT_TEAM screen           │
└────────────────────────────────────────────────────────────────┘
                         │
          ┌──────────────┴───────────────┐
          │                              │
          ▼                              ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│ FILE: app/screens/home/   │  │ FILE: app/screens/       │
│       index.tsx           │  │       select_team/       │
│ ROLE: Home screen with    │  │       select_team.tsx    │
│       Tab Navigator       │  │ ROLE: Join/Select Team   │
│ ├─ HOME_DAAKIA (tab 1)    │  │ ├─ Shows available teams │
│ ├─ SEARCH                 │  │ ├─ Observes nTeams       │
│ ├─ MENTIONS               │  │ └─ Auto-redirects if     │
│ └─ ACCOUNT                │  │    nTeams > 0            │
└───────────────────────────┘  └──────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────────────┐
│  FILE: app/screens/home/home_daakia/index.tsx                  │
│  ROLE: Custom Daakia home with channel list                    │
│  ISSUE: No team validation!                                    │
│  FIX NEEDED:                                                   │
│  ├─ Add nTeams observable                                      │
│  ├─ Check if nTeams === 0                                      │
│  └─ Redirect to SELECT_TEAM if no teams                        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  FILE: app/actions/remote/daakia_logout.ts                     │
│  ROLE: Custom logout function                                  │
│  ISSUE: Doesn't clear database!                                │
│  FIX NEEDED:                                                   │
│  ├─ Add DatabaseManager.deleteServerDatabase(serverUrl)        │
│  ├─ Add Image.clearDiskCache()                                 │
│  └─ Add deleteFileCache(serverUrl)                             │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  FILE: app/queries/servers/team.ts                             │
│  ROLE: Database queries for teams                              │
│  KEY FUNCTION: queryMyTeams(database)                          │
│  ├─ Returns Query<MyTeamModel>                                 │
│  ├─ Used by launchToHome() to check team count                 │
│  └─ Used by SELECT_TEAM to observe team changes                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  FILE: app/database/manager/index.ts                           │
│  ROLE: Database management                                     │
│  KEY FUNCTIONS:                                                │
│  ├─ createServerDatabase() - Creates/initializes DB            │
│  ├─ deleteServerDatabase() - Clears all data but keeps DB      │
│  └─ destroyServerDatabase() - Completely removes DB             │
└────────────────────────────────────────────────────────────────┘
```

---

**Created:** 2025-10-30  
**Purpose:** Visual reference for understanding the team validation flow and session management

