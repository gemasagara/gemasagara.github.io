# Image Upload Feature - Admin Panel

## Overview
Added image upload capability to the admin panel. Instead of manually adding images to GitHub and referencing URLs, you can now:
1. Select images from your computer directly in the admin panel
2. Upload automatically converts to base64
3. Images stored in JSON with the content (self-contained)
4. Main site automatically displays the images

## How It Works

### Image Fields Detected
The following fields automatically become image upload inputs:
- **Projects**: `thumbnail`
- **Awards**: `backgroundImage`
- **Leadership**: `image`
- **Teams**: `logo`
- **Hero/About**: `backgroundImage`, `image`

### Upload Process

1. **Click on image field** in admin panel form
   - Instead of text input, you get a file picker
   - "Upload an image. Max size: 5MB" helper text

2. **Select image from computer**
   - Supported formats: JPG, PNG, GIF, WebP, etc.
   - Max file size: 5MB

3. **Preview appears**
   - Image preview shows immediately after selection
   - Verify it looks correct before saving

4. **Click Update**
   - Image converted to base64 (automatically)
   - Stored in JSON alongside other data
   - Saved to localStorage

### Storage Format

Images are stored as base64 data URLs:
```json
{
  "id": "project-1",
  "title": "My Project",
  "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  ...
}
```

This is a **self-contained format** - no separate image files needed.

## Usage

### Admin Panel
```
1. Go to admin panel: /admin.html
2. Edit a Project, Award, Leadership, or Team item
3. Find the image field (thumbnail, backgroundImage, image, logo)
4. Click to open file picker
5. Select image from computer
6. Preview appears
7. Click Update
8. Image automatically saved
```

### Main Site
Images automatically display on the main portfolio site. The renderers detect base64 data URLs and display them directly.

## Technical Details

### Files Modified

#### js/modules/admin-ui.js
- Added image field detection (`isImageField`)
- For image fields: render file input instead of text
- Shows image preview with styling
- FileReader converts selected file to base64
- Stores base64 in element's `dataset.base64`

#### admin.html
- Added base64 handling in `saveItem()` method
- Checks for image fields and retrieves base64 from `input.dataset.base64`
- Stores base64 string in the itemData before saving

### How Base64 Works

1. **File Selected**
   ```javascript
   FileReader.readAsDataURL(file) → "data:image/jpeg;base64,..."
   ```

2. **Stored in dataset**
   ```javascript
   element.dataset.base64 = "data:image/jpeg;base64,..."
   ```

3. **Saved to JSON**
   ```json
   {"thumbnail": "data:image/jpeg;base64,..."}
   ```

4. **Used in HTML/CSS**
   ```html
   <img src="data:image/jpeg;base64,..." />
   ```

## Advantages

✅ **No separate file management** - Images stored with JSON
✅ **Self-contained** - No broken image links
✅ **Easy to use** - File picker in admin panel
✅ **Automatic preview** - See image before saving
✅ **Size limit** - 5MB max prevents oversized files
✅ **Works offline** - Base64 doesn't need server

## Limitations & Notes

### File Size
- Max 5MB per image
- Base64 increases size by ~33% (important for large images)
- Multiple large images can make JSON file substantial
- localStorage limit: ~5-10MB per domain (total for all data)

### Data URL Performance
- Base64 images are inline (no separate HTTP request)
- Good for small-medium images
- May slow down page load with many large images
- Alternative (future): Extract base64 to actual image files

### Future Optimization
When implementing GitHub API integration, you can:
1. Extract base64 images from JSON
2. Convert to actual image files
3. Upload files to `/images/` folder
4. Update JSON to reference filenames instead of base64
5. Reduce JSON file size by 33%

## Testing

### Test 1: Upload Project Thumbnail
1. Go to admin panel
2. Click "Projects" → Edit a project
3. Find "Thumbnail URL" field
4. Should show file input instead of text
5. Select an image from computer
6. Preview appears
7. Click Update
8. Go to main site Projects section
9. Verify image displays

### Test 2: Upload Award Background
1. Click "Awards" → Edit an award
2. Find "Background Image URL" field
3. Select image
4. Preview shows
5. Click Update
6. Go to main site Awards section
7. Image displays

### Test 3: Multiple Images
1. Create new project with thumbnail
2. Create new award with background image
3. Both should upload and display

### Test 4: Image Size Limit
1. Try uploading file > 5MB
2. Should show alert "Image too large! Max 5MB"
3. File not uploaded

### Test 5: Data Persistence
1. Upload image
2. Click Update
3. Reload admin panel
4. Navigate back to item
5. Image preview still shows
6. Close and reopen browser
7. Image still there (stored in localStorage)

## Examples

### Before (Manual URL)
```json
{
  "id": "project-rover",
  "title": "Rover Project",
  "thumbnail": "https://example.com/images/rover.jpg",
  ...
}
```
- Need to upload to server separately
- Maintain separate image folder
- Risk of broken links

### After (Auto Base64)
```json
{
  "id": "project-rover",
  "title": "Rover Project",
  "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  ...
}
```
- Image data included
- Single JSON file
- No broken links
- Self-contained

## Troubleshooting

### Image not showing on main site
- Check localStorage has the base64 data
- Open DevTools → Application → Local Storage
- Look for `portfolio_admin_data` key
- Search for "data:image"

### "Image too large" error
- File exceeds 5MB
- Compress image or use smaller file

### Preview not showing
- Browser may not support FileReader
- Try different browser
- Check console for errors

### Slow page load with images
- Multiple large base64 images can slow load
- Consider using smaller images
- Or extract to separate files (future optimization)

## Browser Support

✅ Chrome, Firefox, Safari, Edge (all modern versions)
✅ FileReader API (since 2010)
✅ Base64 data URLs (widely supported)

❌ Very old browsers (IE 8 and older)

---

**Status**: ✅ READY TO USE
