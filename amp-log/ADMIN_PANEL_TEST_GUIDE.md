# Admin Panel Test Guide

## Quick Start

1. Open `/admin.html` in your browser
2. The admin panel will load all data from `/data/*.json` files
3. Changes are auto-saved to localStorage every 30 seconds
4. Click "💾 Save All" to export changes as JSON

---

## Testing Sections

### 1. Dashboard
**Test**: Click Dashboard in sidebar
**Expected**: Shows statistics for all content types

**Checklist**:
- [ ] Project count displays
- [ ] Award count displays
- [ ] Leadership count displays
- [ ] Experience count displays
- [ ] Team count displays
- [ ] Export/Import/Reset buttons visible

---

### 2. Projects Section
**Test**: Click "📁 Projects" in sidebar
**Expected**: Table view with all projects

**Create Item**:
- [ ] Click "➕ Add New"
- [ ] Fill in: title, category, year, thumbnail (optional), tagline, featured (checkbox)
- [ ] Click "Create"
- [ ] Project appears in table

**Edit Item**:
- [ ] Click "✏️ Edit" on any project
- [ ] Modify fields
- [ ] Click "Update"
- [ ] Changes appear in table

**Delete Item**:
- [ ] Click "🗑️ Delete" on any project
- [ ] Confirm deletion
- [ ] Project removed from table

**Test Featured Checkbox**:
- [ ] Toggle checkbox in form
- [ ] Value should be true/false (not "true"/"false")
- [ ] localStorage updates correctly

---

### 3. Awards Section
**Test**: Click "🏆 Awards" in sidebar
**Expected**: Table view with all awards

**Create Item**:
- [ ] Click "➕ Add New"
- [ ] Fill in: title, year, description (optional)
- [ ] Test external checkbox
- [ ] Click "Create"

**Edit Item**:
- [ ] Click "✏️ Edit" on any award
- [ ] Modify fields
- [ ] Click "Update"

---

### 4. Leadership Section
**Test**: Click "👥 Leadership" in sidebar
**Expected**: Table view with all leadership items

**Create Item**:
- [ ] Click "➕ Add New"
- [ ] Fill in all required fields
- [ ] Click "Create"

---

### 5. Experiences Section
**Test**: Click "💼 Experiences" in sidebar
**Expected**: Table view with all experiences

**Create/Edit/Delete**: Same pattern as other array types

---

### 6. Teams Section
**Test**: Click "🎯 Teams" in sidebar
**Expected**: Table view with all teams

**Create/Edit/Delete**: Same pattern as other array types

---

### 7. Hero Section (NEW)
**Test**: Click "🏠 Hero" in sidebar
**Expected**: Edit form opens in modal (NOT a table)

**Checklist**:
- [ ] Form displays with all hero fields
- [ ] Can edit title
- [ ] Can edit subtitle
- [ ] Can edit description (textarea)
- [ ] Can edit backgroundImage (URL)
- [ ] CTA field displays as JSON
- [ ] Changes persist after page refresh
- [ ] Visibility dropdown works
- [ ] Delete button is NOT shown

**Test CTA Field**:
- [ ] Edit the CTA field
- [ ] Should display as JSON: `{"text": "View My Work", "link": "#projects"}`
- [ ] Modify text and link values
- [ ] Click Update
- [ ] Verify in localStorage that it's parsed as object, not string

---

### 8. About Section (NEW)
**Test**: Click "👤 About" in sidebar
**Expected**: Edit form opens in modal (NOT a table)

**Checklist**:
- [ ] Form displays with all about fields
- [ ] Can edit image (URL)
- [ ] Can edit greeting (text)
- [ ] Bio field displays as JSON array
- [ ] Skills field displays as JSON array
- [ ] Changes persist after page refresh
- [ ] Visibility dropdown works
- [ ] Delete button is NOT shown

**Test Bio Field (JSON Array)**:
- [ ] Edit the bio field
- [ ] Should display as JSON array of strings
- [ ] Modify one biography string
- [ ] Click Update
- [ ] Verify it's stored as array in localStorage

**Test Skills Field (JSON Array)**:
- [ ] Edit the skills field
- [ ] Should display as JSON array of objects: `[{"name": "Robotics", "level": 90}, ...]`
- [ ] Modify a skill level
- [ ] Click Update
- [ ] Verify stored correctly as array

---

## Advanced Tests

### 1. localStorage Persistence
**Test**: Edit a project and refresh page
**Expected**: Changes still visible

**Steps**:
1. Click "📁 Projects"
2. Click "✏️ Edit" on any project
3. Change title
4. Click "Update"
5. Refresh page (F5)
6. Click "📁 Projects" again
7. [ ] Change should still be there

### 2. Export Functionality
**Test**: Export and re-import data

**Steps**:
1. Click Dashboard
2. Click "📥 Export All Data"
3. Choose "All Data"
4. Click "Export"
5. File downloads as `portfolio-updates.json`
6. [ ] File contains all changed sections

**Export Single Type**:
1. Click "📥 Export All Data"
2. Choose specific type (e.g., "Projects")
3. [ ] File contains only that type

### 3. Import Functionality
**Test**: Import previously exported data

**Steps**:
1. Click Dashboard
2. Click "📤 Import Data"
3. Select a JSON file
4. [ ] File loads successfully
5. [ ] Data appears updated

### 4. Reset Functionality
**Test**: Reset all changes

**Steps**:
1. Make several edits
2. Click Dashboard
3. Click "🔄 Reset All"
4. Confirm
5. [ ] All changes reverted to original
6. [ ] localStorage cleared
7. Refresh page
8. [ ] Still showing original data

### 5. Unsaved Changes Indicator
**Test**: Warning when leaving with unsaved changes

**Steps**:
1. Make a change to any item
2. Try to navigate away
3. [ ] Browser shows "Leave page?" warning
4. [ ] Page prevents navigation
5. Click "💾 Save All"
6. [ ] Indicator disappears
7. Can now navigate away

---

## JSON Field Editing Guide

### Hero CTA Field Example
```json
{
  "text": "View My Work",
  "link": "#projects"
}
```

### About Bio Field Example
```json
[
  "First biography paragraph",
  "Second biography paragraph"
]
```

### About Skills Field Example
```json
[
  { "name": "Robotics", "level": 90 },
  { "name": "Programming", "level": 80 }
]
```

**When editing**:
- Paste the JSON exactly as shown
- Use proper quotes and commas
- If format is wrong, you'll see a warning in console
- The field will still attempt to save but with incorrect parsing

---

## Browser DevTools Testing

### Check localStorage
1. Open DevTools (F12)
2. Go to Application tab
3. Click LocalStorage
4. Find `portfolio_admin_data`
5. View the stored JSON
6. [ ] Should contain all data types
7. [ ] Hero and about should be objects, not arrays

### Check Console Logs
1. Open DevTools Console (F12)
2. Look for log messages:
   - "✅ Admin Manager initialized"
   - "💾 Data saved to localStorage"
   - "📂 Data restored from localStorage"
   - "📥 Data exported"
   - "📤 Data imported successfully"

### Check Network
1. Open DevTools Network tab
2. Refresh page
3. [ ] Should see requests for: hero.json, about.json, projects.json, etc.
4. All should return 200 status

---

## Troubleshooting

### Issue: Form not displaying for hero/about
**Solution**: Check browser console for errors

### Issue: JSON fields showing as [object Object]
**Solution**: The JSON stringification failed. Check console for parsing errors.

### Issue: Changes not persisting
**Solution**: 
- Check that auto-save is running (should see log messages)
- Verify localStorage isn't full
- Check browser privacy settings aren't blocking storage

### Issue: Delete button appears for hero/about
**Solution**: Clear localStorage and refresh - UI may be out of sync

---

## Performance Testing

### Large Dataset Test
1. Create 50+ items in a section
2. [ ] Table still loads quickly
3. [ ] Edit forms open without lag
4. [ ] Scrolling is smooth

### Rapid Changes Test
1. Create item
2. Immediately edit it
3. Immediately create another
4. [ ] No conflicts or lost data
5. [ ] All changes persist

---

## Accessibility Testing

- [ ] All form labels have associated inputs
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Contrast ratios meet accessibility standards
- [ ] Delete confirmation requires explicit action (not just hover)
- [ ] Error messages are clear and actionable

---

## Final Checklist

Before considering the admin panel ready:

- [ ] All 8 sections load correctly
- [ ] Can create/read/update for array types (projects, awards, etc.)
- [ ] Can read/update for object types (hero, about)
- [ ] All field types render correctly (text, textarea, select, checkbox)
- [ ] JSON fields parse and save correctly
- [ ] localStorage persistence works
- [ ] Export/import functionality works
- [ ] Reset functionality works
- [ ] No console errors
- [ ] Responsive design works on mobile
- [ ] Performance is acceptable
