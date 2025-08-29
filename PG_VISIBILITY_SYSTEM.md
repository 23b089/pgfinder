# PG Visibility System

## Overview
This system implements a visibility control mechanism for PG properties where PG owners can control whether their properties appear in the main public search or only in the user feed and owner profile.

## How It Works

### 1. Property Visibility Levels
- **`feed_only`** (Default): PGs are only visible in:
  - User dashboard feed (all users can see them)
  - PG owner's profile/dashboard
  - NOT visible in main public search/browse

- **`public`**: PGs are visible everywhere:
  - Main public search/browse
  - User dashboard feed
  - PG owner's profile/dashboard

### 2. Default Behavior
When a PG owner adds a new PG:
- The PG is automatically set to `visibility: 'feed_only'`
- It will NOT appear in the main public search
- It WILL appear in the user feed for all logged-in users
- It WILL appear in the owner's dashboard

### 3. User Experience

#### For PG Owners:
- **Add PG**: New PGs are automatically set to "Feed Only" visibility
- **Dashboard**: Can see all their PGs with visibility indicators
- **Toggle Visibility**: Can change any PG between "Public" and "Feed Only" using the settings button
- **Visibility Badge**: Each PG shows its current visibility status

#### For Regular Users:
- **Main Search Page** (`/pgs`): Only shows PGs with `public` visibility
- **User Dashboard Feed**: Shows ALL PGs regardless of visibility (both `public` and `feed_only`)
- **Search Tab**: Users can search and filter through all available PGs in their feed

### 4. Technical Implementation

#### Database Changes:
- Added `visibility` field to properties collection
- Default value: `'feed_only'`

#### API Functions:
- `getProperties()`: Only returns `public` properties (for main search)
- `getPropertiesForFeed()`: Returns ALL properties regardless of visibility (for user feed)
- `searchProperties()`: Only searches through `public` properties

#### UI Changes:
- **Add PG Form**: Shows notice about default visibility
- **Owner Dashboard**: Displays visibility badges and toggle buttons
- **Main Search Page**: Shows notice about limited visibility
- **User Dashboard**: Loads all properties in the feed

### 5. Benefits

1. **Privacy Control**: PG owners can keep PGs private initially
2. **Gradual Exposure**: Owners can make PGs public when ready
3. **User Discovery**: Users still discover all PGs through their feed
4. **Quality Control**: Public search only shows PGs owners have chosen to promote
5. **Flexibility**: Easy to toggle visibility without deleting/recreating

### 6. Usage Examples

#### Making a PG Public:
1. Go to Owner Dashboard
2. Find the PG you want to make public
3. Click the Settings button (gear icon)
4. PG visibility changes from "Feed Only" to "Public"
5. PG now appears in main search results

#### Making a PG Feed-Only:
1. Go to Owner Dashboard
2. Find the PG you want to make feed-only
3. Click the Settings button (gear icon)
4. PG visibility changes from "Public" to "Feed Only"
5. PG no longer appears in main search results

### 7. Future Enhancements

- **Bulk Visibility Management**: Change visibility for multiple PGs at once
- **Visibility Analytics**: Track how visibility affects booking rates
- **Scheduled Visibility**: Automatically change visibility on specific dates
- **Visibility Rules**: Set conditions for automatic visibility changes

## File Changes Made

1. **`src/lib/properties.js`**
   - Added `visibility` field to `addProperty()`
   - Modified `getProperties()` to filter by `public` visibility
   - Modified `searchProperties()` to filter by `public` visibility
   - Added `getPropertiesForFeed()` for user dashboard

2. **`src/app/dashboard/owner/add-pg/page.js`**
   - Set default visibility to `'feed_only'`
   - Added visibility notice for users

3. **`src/app/dashboard/owner/page.js`**
   - Added visibility badges to PG cards
   - Added toggle visibility functionality
   - Added settings button for each PG

4. **`src/app/dashboard/user/page.js`**
   - Integrated with `getPropertiesForFeed()`
   - Shows all PGs in user feed regardless of visibility
   - Added search and filtering within the feed

5. **`src/app/pgs/page.js`**
   - Added notice about limited visibility
   - Only shows public PGs in main search

This system ensures that PG owners have full control over their property visibility while maintaining a rich user experience for both owners and users.
