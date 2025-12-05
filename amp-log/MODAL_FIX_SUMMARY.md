# Modal Display Bug Fix

## Problem
When clicking "Hero", "About", or the edit/create buttons for any content type, the screen would grey out but the form wouldn't appear. The only way to recover was to reload the page. However, delete buttons worked fine because they use `alert()` instead of a modal.

## Root Cause
The `renderEditForm()` function in `admin-ui.js` was returning the entire modal structure including:
- `<div class="modal-overlay">`
- `<div class="modal-content">`

But this HTML was being inserted into `#modalContent`, which is already inside the modal structure:
```html
<div id="editModal" class="modal-overlay">
  <div class="modal-content">
    <div id="modalContent">
      <!-- Form being inserted here -->
    </div>
  </div>
</div>
```

This created **nested modals**, which broke the interaction because:
1. The inner modal-overlay was blocking clicks
2. The modal-content structure was duplicated
3. Event handlers weren't properly attached

## Solution

### 1. Changed `admin-ui.js` renderEditForm()
**Before**: Returned complete modal structure
```javascript
let html = `
  <div class="modal-overlay" onclick="...">
    <div class="modal-content">
      <div class="modal-header">
        ...
      </div>
      <form>
        ...
      </form>
    </div>
  </div>
`;
```

**After**: Returns only the form content
```javascript
let html = `
  <div class="modal-header">
    ...
  </div>
  <form>
    <div class="modal-body">
      ...
    </div>
    <div class="modal-footer">
      ...
    </div>
  </form>
`;
```

### 2. Updated `admin.html` modal structure
**Added**: onclick handler to the main modal-overlay to close when clicking outside the form
```html
<div 
  id="editModal" 
  class="modal-overlay" 
  onclick="if(event.target === this) window.adminPanel.closeModal()"
>
  <div class="modal-content">
    <div id="modalContent">
      <!-- Form content inserted here -->
    </div>
  </div>
</div>
```

## Result
- ✅ Modal displays properly when editing/creating items
- ✅ Form is fully interactive
- ✅ Can click buttons and fill fields
- ✅ Can close modal by clicking the X button
- ✅ Can close modal by clicking outside the form
- ✅ Hero and About sections now work correctly

## Files Changed
1. `js/modules/admin-ui.js` - Fixed renderEditForm() structure
2. `admin.html` - Added onclick handler to modal-overlay

## Testing
After this fix:
- Click Hero → Form displays and is interactive
- Click About → Form displays and is interactive
- Click "Add New" on any section → Form displays and is interactive
- Click "Edit" on any item → Form displays and is interactive
- Press Escape or click X → Modal closes
- Click outside modal → Modal closes
