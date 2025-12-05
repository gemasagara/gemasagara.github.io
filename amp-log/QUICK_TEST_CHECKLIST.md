# Quick Test Checklist - Modal Fix

## Test 1: Hero Section
- [ ] Click "🏠 Hero" in sidebar
- [ ] Verify form appears (not greyed out screen)
- [ ] Verify can type in form fields
- [ ] Verify X button closes form
- [ ] Verify Cancel button closes form
- [ ] Click outside modal → should close

## Test 2: About Section
- [ ] Click "👤 About" in sidebar
- [ ] Verify form appears (not greyed out screen)
- [ ] Verify can type in form fields
- [ ] Verify X button closes form
- [ ] Verify Cancel button closes form
- [ ] Click outside modal → should close

## Test 3: Projects - Add New
- [ ] Click "📁 Projects"
- [ ] Click "➕ Add New"
- [ ] Verify form appears (not greyed out screen)
- [ ] Verify can fill all fields
- [ ] Verify Create button works
- [ ] Verify Cancel button closes

## Test 4: Projects - Edit
- [ ] Click "📁 Projects"
- [ ] Click "✏️ Edit" on any project
- [ ] Verify form appears with existing data
- [ ] Verify can modify fields
- [ ] Verify Update button works
- [ ] Verify changes persist after close and re-open

## Test 5: Delete (Should Already Work)
- [ ] Click "📁 Projects"
- [ ] Click "🗑️ Delete" on any project
- [ ] Verify alert appears asking "Delete?"
- [ ] Click OK or Cancel

## Test 6: Form Field Types
- [ ] Test text input (title, name, etc.)
- [ ] Test textarea (description, bio, etc.)
- [ ] Test checkbox (featured, external)
- [ ] Test select dropdown (visibility)
- [ ] Test number input (order)

## Test 7: JSON Fields (Hero/About)
- [ ] Edit Hero CTA field - should show JSON
- [ ] Edit About Bio field - should show JSON
- [ ] Edit About Skills field - should show JSON
- [ ] Verify JSON can be edited and saved

## Test 8: Modal Closing
- [ ] Click X button → modal closes
- [ ] Click Cancel button → modal closes
- [ ] Click outside modal (on grey area) → modal closes
- [ ] After close, can open another form

## Expected Results
✅ All forms should display and be interactive
✅ No greyed-out screen without visible form
✅ All buttons should work properly
✅ Modal should close cleanly
✅ Can open multiple forms in sequence without page reload

If any test fails, check browser console (F12) for errors.
