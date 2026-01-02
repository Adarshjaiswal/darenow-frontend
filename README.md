# Technical Documentation: Image Upload Optimization and Validation

## Overview

This document describes the implementation of batch image upload functionality and enhanced validation for restaurant image uploads in the DareNow frontend application. The changes optimize API calls by uploading multiple images in a single request and enforce a maximum limit of 10 images per category with proper error handling.

## Problem Statement

### Issues Identified

1. **Inefficient API Calls**: Detail images were being uploaded one-by-one in a loop, resulting in multiple API calls for the same operation.
2. **Missing Error Display**: Validation for maximum image count (10 images) was implemented but error messages were not displayed in the Edit Restaurant page UI.
3. **Poor User Experience**: Users could select more than 10 images without receiving immediate feedback about the limit violation.

## Solution Implementation

### 1. Batch Upload Implementation

**Before:**
```javascript
// Detail images uploaded one by one
if (detailImages.length > 0) {
  for (const image of detailImages) {
    await uploadImage(placeId, 'addDetailImage', 'detailImage', [image]);
  }
}
```

**After:**
```javascript
// All detail images uploaded in a single API call
if (detailImages.length > 0) {
  await uploadImage(placeId, 'addDetailImage', 'detailImage', detailImages);
}
```

### 2. Enhanced Validation with Error Display

Added error message display components in the Edit Restaurant page for all image types:
- Detail Images
- Food Menu Images
- Beverages Menu Images

### 3. File Input Clearing on Validation Failure

When validation fails (e.g., more than 10 images selected), the file input is automatically cleared to prevent invalid files from being processed.

## Technical Details

### Files Modified

1. **`src/pages/CreateRestaurant.js`**
   - Updated detail image upload to batch mode
   - Enhanced validation with file input clearing
   - Added error message display (already existed, verified)

2. **`src/pages/EditRestaurant.js`**
   - Updated detail image upload to batch mode
   - Added error message display components for all image types
   - Enhanced validation with file input clearing

### API Endpoints

#### Detail Images
- **Endpoint**: `POST /api/place/{placeId}/addDetailImage`
- **Content-Type**: `multipart/form-data`
- **Field Name**: `detailImage`
- **Behavior**: Accepts multiple files in a single request
- **Example**:
  ```bash
  curl --location 'http://3.111.88.208:3000/api/place/1/addDetailImage' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --form 'detailImage=@"/path/to/file1"' \
  --form 'detailImage=@"/path/to/file2"'
  ```

#### Menu Images (Food & Beverages)
- **Endpoint**: `POST /api/place/{placeId}/addFoodMenuImages` or `POST /api/place/{placeId}/addBeveragesMenuImages`
- **Content-Type**: `multipart/form-data`
- **Field Name**: `menuImages`
- **Behavior**: Accepts multiple files in a single request
- **Example**:
  ```bash
  curl --location 'http://3.111.88.208:3000/api/place/1l/addBeveragesMenuImages' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --form 'menuImages=@"/path/to/file1"' \
  --form 'menuImages=@"/path/to/file2"'
  ```

### Validation Logic

#### Constants
```javascript
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB in bytes
const MAX_IMAGES = 10; // Maximum images per category
```

#### Create Restaurant Page Validation

For each image type (detail, food menu, beverages menu):
1. Check if selected files exceed 10 images
2. Validate each file size (max 2 MB)
3. Clear file input if validation fails
4. Display error message if validation fails
5. Generate previews only if validation passes

**Validation Flow:**
```
User selects files
    ↓
Check file count > 10?
    ↓ Yes → Set error, clear input, return
    ↓ No
Check file sizes > 2MB?
    ↓ Yes → Set error, clear input, return
    ↓ No
Clear previous errors
    ↓
Set images in state
    ↓
Generate previews
```

#### Edit Restaurant Page Validation

Similar to Create Restaurant, but accounts for existing images:
1. Calculate total images: `existingImages.length + newImages.length`
2. Check if total exceeds 10 images
3. Validate each new file size (max 2 MB)
4. Clear file input if validation fails
5. Display error message if validation fails
6. Generate previews only if validation passes

**Validation Flow:**
```
User selects files
    ↓
Calculate: existingImages + newImages
    ↓
Check total > 10?
    ↓ Yes → Set error, clear input, return
    ↓ No
Check new file sizes > 2MB?
    ↓ Yes → Set error, clear input, return
    ↓ No
Clear previous errors
    ↓
Set new images in state
    ↓
Generate previews
```

### Error Messages

#### Create Restaurant
- Detail Images: `"Maximum 10 images allowed. You selected {count} images."`
- Food Menu Images: `"Maximum 10 images allowed. You selected {count} images."`
- Beverages Menu Images: `"Maximum 10 images allowed. You selected {count} images."`
- File Size: `"Some images exceed 2 MB limit. Please select smaller images."`

#### Edit Restaurant
- Detail Images: `"Maximum 10 images allowed. You have {existing} existing images and selected {new} new images."`
- Food Menu Images: `"Maximum 10 images allowed. You have {existing} existing images and selected {new} new images."`
- Beverages Menu Images: `"Maximum 10 images allowed. You have {existing} existing images and selected {new} new images."`
- File Size: `"Some images exceed 2 MB limit. Please select smaller images."`

### Upload Function Implementation

The `uploadImage` function handles both single and multiple file uploads:

```javascript
const uploadImage = async (placeId, endpoint, formDataField, files) => {
  if (!files || files.length === 0) return;
  
  const formData = new FormData();
  // Append all files to FormData
  files.forEach((file) => {
    formData.append(formDataField, file);
  });

  try {
    await api.post(`/place/${placeId}/${endpoint}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error(`Error uploading ${endpoint}:`, error);
    throw error;
  }
};
```

## Code Changes Summary

### CreateRestaurant.js

**Line 894-898**: Changed from loop-based upload to batch upload
```javascript
// Before
if (detailImages.length > 0) {
  for (const image of detailImages) {
    await uploadImage(placeId, 'addDetailImage', 'detailImage', [image]);
  }
}

// After
if (detailImages.length > 0) {
  await uploadImage(placeId, 'addDetailImage', 'detailImage', detailImages);
}
```

**Lines 596-602, 675-681, 754-760**: Added file input clearing on validation failure

### EditRestaurant.js

**Line 894-898**: Changed from loop-based upload to batch upload
```javascript
// Before
if (detailImages.length > 0) {
  for (const image of detailImages) {
    await uploadImage('addDetailImage', 'detailImage', [image]);
  }
}

// After
if (detailImages.length > 0) {
  await uploadImage('addDetailImage', 'detailImage', detailImages);
}
```

**Lines 1568, 1632, 1694**: Added error message display components
```javascript
{fieldErrors.detailImages && (
  <p className="mt-1 text-sm text-red-600">{fieldErrors.detailImages}</p>
)}
```

**Lines 559-565, 646-652, 733-739**: Added file input clearing on validation failure

## User Experience Improvements

### Before
- Multiple API calls for detail images (one per image)
- No visible error when selecting more than 10 images
- Files remained selected even after validation failure
- Poor performance with many images

### After
- Single API call for all detail images
- Immediate error feedback when limit exceeded
- File input automatically cleared on validation failure
- Better performance with batch uploads
- Clear error messages showing exact counts

## Testing Considerations

### Test Cases

1. **Create Restaurant - Detail Images**
   - [ ] Select 5 images → Should succeed
   - [ ] Select 10 images → Should succeed
   - [ ] Select 11 images → Should show error and clear input
   - [ ] Select 14 images → Should show error and clear input
   - [ ] Select files > 2MB → Should show size error

2. **Create Restaurant - Menu Images**
   - [ ] Food menu: Select 10 images → Should succeed
   - [ ] Food menu: Select 11 images → Should show error
   - [ ] Beverages menu: Select 10 images → Should succeed
   - [ ] Beverages menu: Select 11 images → Should show error

3. **Edit Restaurant - Detail Images**
   - [ ] 1 existing + 9 new → Should succeed
   - [ ] 1 existing + 10 new → Should succeed (total = 11, but validation should pass)
   - [ ] 1 existing + 14 new → Should show error with correct count message
   - [ ] 5 existing + 6 new → Should succeed
   - [ ] 5 existing + 6 new → Should show error (total = 11)

4. **Edit Restaurant - Menu Images**
   - [ ] Similar test cases as detail images

5. **API Integration**
   - [ ] Verify batch upload sends all files in single request
   - [ ] Verify API accepts multiple files correctly
   - [ ] Verify error handling for failed uploads

## Performance Impact

### Before
- **Detail Images (10 images)**: 10 API calls
- **Network Requests**: High
- **Upload Time**: Sequential, slower

### After
- **Detail Images (10 images)**: 1 API call
- **Network Requests**: Reduced by 90%
- **Upload Time**: Parallel, faster

## Browser Compatibility

- Modern browsers with FormData support
- File API support required
- Multiple file selection support

## Future Enhancements

1. **Progress Indicator**: Add upload progress bar for batch uploads
2. **Image Compression**: Client-side image compression before upload
3. **Drag and Drop**: Support drag-and-drop file selection
4. **Image Preview Grid**: Better preview layout for multiple images
5. **Retry Mechanism**: Automatic retry for failed uploads
6. **Chunked Upload**: For very large files, implement chunked upload

## Dependencies

- React (for component lifecycle)
- Axios (for API calls)
- FileReader API (for image previews)
- FormData API (for multipart uploads)

## Related Files

- `src/pages/CreateRestaurant.js` - Restaurant creation form
- `src/pages/EditRestaurant.js` - Restaurant editing form
- `src/utils/api.js` - API utility functions
- `src/components/Toast.js` - Toast notification component

## Notes

- The API endpoints must support multiple files with the same field name
- File input clearing is necessary because browsers don't allow programmatic file selection clearing
- Error messages are displayed immediately after file selection
- Validation occurs before file processing to prevent unnecessary operations

## Version History

- **v1.0** (Current): Initial implementation of batch upload and enhanced validation
  - Batch upload for detail images
  - Error message display in Edit Restaurant
  - File input clearing on validation failure
  - Enhanced validation for all image types

