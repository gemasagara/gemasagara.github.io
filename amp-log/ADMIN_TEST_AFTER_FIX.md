# Testing Guide - After Bug Fixes

## Critical Tests (Must Pass)

### Test 1: Hero Section Loads Data
1. Open admin.html
2. Click "🏠 Hero" in sidebar
3. **Expected**: Form shows "Edit Hero" title (not "Create Hero")
4. **Expected**: Form fields populated with existing data from hero.json:
   - Title: "Gema Sagara"
   - Subtitle: "Robotics & ML | Rocketry | Scientific Research"
   - Description: Contains text about high school student
   - Background Image: "./images/cakrawala2.png"
   - CTA: Shows JSON with text and link
5. **Expected**: Can edit the fields and save

### Test 2: About Section Loads Data
1. Open admin.html
2. Click "👤 About" in sidebar
3. **Expected**: Form shows "Edit About" title (not "Create About")
4. **Expected**: Form fields populated with existing data from about.json:
   - Image: "./images/one.jpeg"
   - Greeting: "Hello, I'm Gema Sagara"
   - Bio: Shows JSON array with biography paragraphs
   - Skills: Shows JSON array with skill objects
5. **Expected**: Can edit the fields and save

### Test 3: Create New Project
1. Click "📁 Projects"
2. Click "➕ Add New"
3. **Expected**: Form shows "Create Projects" (not "Edit")
4. Fill in required fields:
   - Title: "Test Project"
   - Category: "Test"
   - Year: "2025"
   - Tagline: "Test project description"
5. Click "Create"
6. **Expected**: Project appears in table
7. **Expected**: ✅ Item created successfully! message appears

### Test 4: Edit Existing Project
1. Click "📁 Projects"
2. Click "✏️ Edit" on any project
3. **Expected**: Form shows "Edit Projects"
4. **Expected**: Form fields populated with existing data
5. Change title to something new
6. Click "Update"
7. **Expected**: ✅ Item updated successfully! message appears
8. **Expected**: Changes visible in table immediately

### Test 5: Delete Project (Already Works)
1. Click "📁 Projects"
2. Click "🗑️ Delete" on any project
3. **Expected**: "Delete?" alert appears
4. Click OK
5. **Expected**: Project removed from table
6. **Expected**: ✅ Item deleted successfully! message appears

### Test 6: JSON Fields Parse Correctly
1. Edit Hero section
2. Modify CTA field:
   ```json
   {
     "text": "Explore Projects",
     "link": "#portfolio"
   }
   ```
3. Click "Update"
4. **Expected**: Changes saved successfully
5. Open browser DevTools (F12)
6. Go to Application → LocalStorage → portfolio_admin_data
7. **Expected**: CTA is stored as object, not string

### Test 7: JSON Arrays Work
1. Edit About section
2. Modify Bio field to:
   ```json
   [
     "First line of bio",
     "Second line of bio",
     "Third line of bio"
   ]
   ```
3. Click "Update"
4. **Expected**: Changes saved
5. Refresh page (F5)
6. **Expected**: Bio changes persist
7. Open localStorage in DevTools
8. **Expected**: Bio is stored as array, not string

### Test 8: Data Persists After Refresh
1. Edit any item (hero, about, or project)
2. Change one field
3. Click "Update"
4. Refresh page (F5)
5. **Expected**: Changes still visible
6. Navigate to that section again
7. **Expected**: Edited item shows the changed data

---

## Edit & Create Flow Test

### Projects/Awards/Leadership/Experiences/Teams
**Create Flow**:
- Add New → Shows "Create [Type]" → Can fill all fields → Click Create → Appears in list

**Edit Flow**:
- Edit → Shows "Edit [Type]" → Fields pre-filled → Modify → Click Update → Changes visible

### Hero & About
**Edit Flow Only**:
- Open section → Shows "Edit [Type]" → Fields pre-filled with actual data → Modify → Click Update → Changes visible

---

## Issue Verification

### Issue 1: Hero/About data are empty ✅ FIXED
**Before**: Opened as "Create Hero" with empty form
**After**: Opens as "Edit Hero" with data from JSON

**Verification**: 
- [ ] Hero shows "Edit" not "Create"
- [ ] Hero fields populated with data
- [ ] About shows "Edit" not "Create"
- [ ] About fields populated with data

### Issue 2: Edit doesn't update the site ✅ SHOULD BE FIXED
**Before**: Changes might not save or persist
**After**: Changes saved to localStorage immediately, persist across refreshes

**Verification**:
- [ ] Make a change to any item
- [ ] See "✅ Item updated successfully!" message
- [ ] Refresh page
- [ ] Changes still visible

### Issue 3: Adding new data didn't work ✅ SHOULD BE FIXED
**Before**: New items might not save
**After**: Create button properly handles new items

**Verification**:
- [ ] Create new project
- [ ] See "✅ Item created successfully!" message
- [ ] Item appears in table immediately
- [ ] Refresh page
- [ ] Item still in table

---

## Advanced Tests

### Test: JSON Parse Errors
1. Edit Hero CTA field
2. Enter invalid JSON:
   ```
   { "text": "test" (missing closing brace)
   ```
3. Click "Update"
4. **Expected**: See warning in browser console
5. **Expected**: Still saves but with warning
6. Check console for: "Could not parse cta:"

### Test: Form Validation
1. Try to create new project without title
2. **Expected**: Form prevents submission (HTML5 validation)
3. Fill in title
4. **Expected**: Can now submit

### Test: Modal Closing
1. Open any form (Create or Edit)
2. Click X button
3. **Expected**: Modal closes, can see main content
4. Open form again
5. Click Cancel button
6. **Expected**: Modal closes
7. Open form again
8. Click outside modal (on greyed area)
9. **Expected**: Modal closes

---

## Data Flow Verification

### Saved Changes Path
```
User fills form
    ↓
Clicks Create/Update
    ↓
Form data extracted
    ↓
JSON fields parsed (bio, skills, tags, cta)
    ↓
CreateItem() or UpdateItem() called
    ↓
Data updated in memory
    ↓
Timestamps set/updated
    ↓
SaveToLocalStorage() called
    ↓
✅ Success message shown
    ↓
Modal closes
    ↓
Table/form refreshed
```

---

## Browser Tools Testing

### DevTools Console
Open DevTools (F12) → Console tab
**Expected log messages**:
- ✅ Admin Manager initialized
- 💾 Data saved to localStorage
- 📂 Data restored from localStorage

**No error messages should appear**

### DevTools Application/Storage
Open DevTools → Application → LocalStorage → portfolio_admin_data
**Expected**:
- Contains all data types: projects, awards, hero, about, etc.
- Hero/about are objects `{...}`
- Projects/awards/etc are arrays `[...]`
- Timestamps are ISO format
- JSON fields are parsed objects, not strings

---

## Performance Check

### Large Dataset
1. Click on each section (Projects, Awards, Leadership, Experiences, Teams)
2. **Expected**: All load within 1 second
3. **Expected**: No lag when scrolling tables
4. **Expected**: No memory warnings in DevTools

### Rapid Changes
1. Open form → Change field → Click Update
2. Immediately open another form
3. Make changes
4. **Expected**: No conflicts or lost data
5. **Expected**: Both changes persist

---

## Cleanup Test

### Reset Functionality
1. Make several changes across different sections
2. Click Dashboard
3. Click "🔄 Reset All"
4. Confirm
5. **Expected**: All changes reverted to original
6. **Expected**: localStorage cleared
7. Refresh page (F5)
8. **Expected**: Still showing original data
9. Click each section
10. **Expected**: Original data visible everywhere

---

## Final Sign-Off Checklist

- [ ] Hero data loads correctly
- [ ] About data loads correctly
- [ ] Create new items works for arrays
- [ ] Edit items works for all types
- [ ] Delete items works for arrays (hidden for hero/about)
- [ ] JSON fields parse correctly
- [ ] Data persists after refresh
- [ ] Export/import works
- [ ] No console errors
- [ ] All buttons responsive
- [ ] Modal properly opens/closes
- [ ] All tests pass

If all tests pass, the admin panel is ready for use!
