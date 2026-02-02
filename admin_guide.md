# Admin Panel Guide - AuraScents

## 🔐 Accessing the Admin Panel

1. Open `admin.html` in your browser
2. Enter the password: `aurascents2026`
3. Click "Sign In"

**To change the password:** Edit line 2 in `js/admin.js`:
```javascript
const ADMIN_PASSWORD = 'your_new_password';
```

---

## 📦 Managing Products

### Adding a New Product

1. Click **"Add New Product"** button
2. **Upload Image:**
   - Click "Choose File"
   - Select product image (JPEG, PNG, etc.)
   - Image will be shown as preview
   
3. **Enter Product Details:**
   - **Product Name:** e.g., "Blossom"
   - **Category:** Select "Ladies" or "Men"
   - **Price:** Enter price in GH₵ (e.g., 250)
   
4. **Add Package Items:**
   - Type item name (e.g., "Mini perfume")
   - Click the "+" button
   - Repeat for all items in the package
   - You can remove items by clicking the X
   
5. Click **"Save Product"**

### Editing an Existing Product

1. Find the product in the table
2. Click the **edit icon** (pencil)
3. Update any fields you want to change
4. Click **"Save Product"**

### Deleting a Product

1. Find the product in the table
2. Click the **delete icon** (trash)
3. Confirm deletion
4. Product is permanently removed

---

## 💾 How Product Storage Works

### Browser Storage (Current System)
Products are saved in **localStorage** - your browser's local storage:

**✅ Advantages:**
- No backend needed
- Instant updates
- Easy to manage
- Works offline

**⚠️ Limitations:**
- Products only visible on YOUR computer/browser
- Clearing browser data deletes products
- Not shared across devices
- Not permanent on the live website

### Making Products Permanent on Your Website

To make your products appear on the deployed Netlify site:

**Option 1: Manual Update (Simple)**

1. Click **"Export Products"** button in admin
2. Download the JSON file
3. Open `js/storefront.js`
4. Replace the `defaultProducts` object with your exported data
5. Redeploy to Netlify

**Option 2: Backend Integration (Advanced)**

Follow the `BACKEND_GUIDE.md` to set up:
- Firebase (easiest)
- Supabase
- Custom backend

---

## 📊 Dashboard Statistics

The dashboard shows:
- **Total Products:** Count of all products
- **Ladies Products:** Number of ladies packages
- **Men Products:** Number of men packages
- **Total Value:** Sum of all product prices

---

## 🖼️ Product Images

### Image Formats Supported
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Image Guidelines
- **Recommended size:** 800x800 pixels or larger
- **File size:** Keep under 2MB for faster loading
- **Quality:** Use high-quality product photos
- **Background:** Clean, professional backgrounds work best

### How Images are Stored
Images are converted to **Base64** format and stored directly in localStorage. This means:
- No separate image files needed
- Images stored with product data
- Easy to export and import
- Works without server

---

## 📤 Exporting Products

### When to Export
- Before clearing browser data
- To backup your products
- To share products with another computer
- To deploy to production website

### How to Export
1. Click **"Export Products"** button
2. JSON file downloads automatically
3. Save this file safely
4. Named: `aurascents-products-[timestamp].json`

### Using Exported Products
The exported JSON contains all products with:
- Product ID
- Name
- Category
- Price
- Image (base64)
- Items list

Copy this data to update your website code.

---

## 🔧 Technical Details

### Product Data Structure
```javascript
{
  id: 'lady1',              // Unique identifier
  name: 'Blossom',        // Product name
  price: 250,               // Price in GH₵
  category: 'ladies',       // 'ladies' or 'men'
  image: 'base64...',       // Image data or path
  items: [                  // Array of items
    'Mini perfume',
    'Scented candle',
    ...
  ]
}
```

### Storage Location
- **localStorage key:** `aurascents_products`
- **Session authentication:** `aurascents_admin_auth`
- **Max storage:** ~5-10MB (browser dependent)

---

## 🚀 Deployment Workflow

### For Testing (Current Setup)
1. Use admin panel to add products
2. Test on your local computer
3. Products saved in browser

### For Production (Recommended)
1. Add all products in admin panel
2. Click "Export Products"
3. Open `js/storefront.js`
4. Update `defaultProducts` with exported data
5. Deploy to Netlify
6. Products now live for all visitors!

---

## 🐛 Troubleshooting

### Products Not Showing
**Problem:** Added products don't appear on storefront

**Solutions:**
- Refresh the page (Ctrl+F5)
- Check if products were saved (check console)
- Verify localStorage has data (DevTools → Application → Local Storage)

### Images Not Displaying
**Problem:** Product images show as "No Image"

**Solutions:**
- Check file format (JPEG, PNG supported)
- Ensure file size under 5MB
- Try re-uploading the image
- Check browser console for errors

### Can't Login
**Problem:** Password not working

**Solutions:**
- Verify password: `aurascents2026` (case-sensitive)
- Clear browser cache
- Check for typos
- Try different browser

### Products Disappeared
**Problem:** All products gone after closing browser

**Solutions:**
- Don't clear browser data
- Export products regularly as backup
- Check if browser is in private/incognito mode
- Restore from exported JSON file

### Storage Full
**Problem:** Can't add more products

**Solutions:**
- Browser localStorage limit reached (~5-10MB)
- Optimize images (compress before upload)
- Remove unused products
- Consider backend solution for unlimited storage

---

## 💡 Best Practices

1. **Regular Backups**
   - Export products weekly
   - Keep backup files safe
   - Name files with dates

2. **Image Optimization**
   - Compress images before upload
   - Use appropriate dimensions
   - Keep file sizes reasonable

3. **Product Organization**
   - Use clear, descriptive names
   - Keep pricing consistent
   - List items in logical order

4. **Testing**
   - Test each product after adding
   - Verify on storefront
   - Check mobile display

5. **Security**
   - Change default password
   - Log out after use
   - Don't share password

---

## 🔄 Updating to Production

### Step-by-Step Guide

**1. Prepare Products**
```
- Add all products in admin panel
- Upload proper images
- Set correct prices
- Add all package items
```

**2. Export Data**
```
- Click "Export Products"
- Save JSON file
- Open in text editor
```

**3. Update Code**
```javascript
// In js/storefront.js, replace defaultProducts:
const defaultProducts = {
    ladies: [
        // Paste your exported ladies products here
    ],
    men: [
        // Paste your exported men products here
    ]
};
```

**4. Deploy**
```
- Upload to Netlify
- Test live site
- Verify all products show
```

---

## 📞 Support

Need help?
- **WhatsApp:** 0206845402
- **Phone:** 0557743737
- **Location:** Knust, Kotei

---

## 🎯 Quick Reference

| Action | Button/Location |
|--------|----------------|
| Add Product | "Add New Product" button |
| Edit Product | Pencil icon in table |
| Delete Product | Trash icon in table |
| Export Products | "Export Products" button |
| Upload Image | File input in product form |
| Save Changes | "Save Product" button |
| Logout | "Logout" button in header |

---

**Version:** 1.0  
**Last Updated:** February 2026
