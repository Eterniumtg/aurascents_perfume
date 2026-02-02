# AuraScents - Premium Perfumes

A beautiful e-commerce website for AuraScents offering premium perfumes and curated gift packages with full mobile optimization and product images.

## 🌟 Features

- 🎁 Special gift packages and signature perfumes
- 💝 Ladies and Men collections with product images
- 🛒 Fully functional shopping cart
- 📱 **100% Mobile Responsive** - Works perfectly on all devices
- 💬 WhatsApp checkout integration
- 🖼️ Product images for better visualization
- ⚡ Fast loading and smooth animations
- 📞 Multiple contact methods (WhatsApp, Snapchat)
- 👨‍💼 **Admin Panel** - Manage products easily (NEW!)

## 👨‍💼 Admin Panel

### Access Admin Panel
- Open `admin.html`
- Password: `aurascents2026`
- Full product management system

### Admin Features
✅ **Add New Products** - Upload images and set details  
✅ **Edit Products** - Update any product information  
✅ **Delete Products** - Remove products easily  
✅ **Product Images** - Upload custom product photos  
✅ **Export Products** - Backup your product catalog  
✅ **Real-time Stats** - Track inventory and pricing  

### How It Works
- Products saved in browser localStorage
- Easy drag-and-drop image upload
- Export products to deploy to website
- See `ADMIN_GUIDE.md` for full instructions

**Note:** To make products permanent on your deployed website, export them from admin and update `js/storefront.js`

## 📦 Products

### Ladies Packages
1. **Blossom** - GH₵ 250
   - Mini perfume, Scented candle, Lipgloss and liner, Chocolate, Handcream, Bracelet

2. **Petal** - GH₵ 250
   - Mini perfume, Hairclips, Chocolate, Purse, Necklace, Lipgloss

3. **Muse** - GH₵ 350
   - Mini perfume, Body Splash, Hand fan, Necklace, Lipgloss and liner, Chocolate

4. **Signature Luxe** - GH₵ 580
   - Luxury Perfume (100ml), Hand fan, Diary, Hairclips, Champagne, Chocolate, Handcream

### Men Packages
1. **Classic Man** - GH₵ 450
   - Perfume, Wallet, Belt, Champagne, Chocolate

2. **Timeless** - GH₵ 500
   - Perfume (100ml), Watch, Bracelet, Champagne, Chocolate

3. **Heritage** - GH₵ 700
   - Luxury Perfume (100ml), Men's slippers, Wallet, Room Diffuser, Chocolates, Atomizer

## 📞 Contact Information

- **WhatsApp:** 0206845402
- **Phone:** 0557743737
- **Snapchat:** naa.dei18
- **Location:** Knust, Kotei

## 🚀 Quick Start

1. Open `index.html` in your browser
2. Browse products
3. Add items to cart
4. Checkout via WhatsApp

## 📱 Mobile Optimized

The website is fully optimized for:
- ✅ Mobile phones (iOS & Android)
- ✅ Tablets
- ✅ Desktop computers
- ✅ All screen sizes

Features:
- Touch-friendly buttons
- Responsive images
- Mobile navigation menu
- Optimized font sizes
- Smooth scrolling

## 🌐 Deployment with GitHub Pages (recommended)

This project includes a GitHub Actions workflow that builds the site and publishes it to the `gh-pages` branch on every push to `main`.

1. Create a repository on GitHub and push your project to `main`:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. Enable GitHub Pages for the repository and set the source to the `gh-pages` branch (the workflow will create/update it automatically).

3. (Optional) To allow using the Admin panel to update products automatically, create a Personal Access Token (PAT) with `repo` permissions and enter it in the Admin → GitHub Deployment Settings.

Notes:
- Product updates committed via the Admin panel will update `data/products.json` which triggers the GitHub Actions workflow and redeploys the site.

Server vs Client commit modes (recommended: Server)

- Server mode (recommended): Deploy the `commit-products` serverless function and store a GitHub Personal Access Token (PAT) as an environment variable on your hosting provider (name it `GITHUB_PAT`). When configured, the Admin panel will call `/api/commit-products` and the server will commit `data/products.json` and emit a `repository_dispatch` event to trigger the `dispatch-deploy.yml` workflow. This keeps the PAT off users' browsers and is more secure.

- Client mode (fallback): If you prefer not to run a server, you can enter a PAT directly into Admin → GitHub Deployment Settings. The admin UI will use the PAT from your browser's localStorage to commit the file (less secure — token lives on the client).

How to create a PAT (short):
1. In GitHub: Settings → Developer settings → Personal access tokens → Generate new token (classic or fine-grained).
2. Give the token minimal scopes required to update repository contents (e.g., `repo` for classic tokens, or the equivalent repository write access for fine-grained tokens).
3. Save the token securely — do NOT paste it into chat or public places.

How to set server env vars

- Netlify:
  1. Go to Site settings → Build & deploy → Environment → Environment variables
  2. Add `GITHUB_PAT` = your PAT, optionally `GITHUB_OWNER` and `GITHUB_REPO` if you want the server to default to those values, and `ADMIN_PASSWORD` if you want to require it for server commits.
  3. Deploy the site (Netlify will build functions and host `/.netlify/functions/commit-products`).

- Vercel:
  1. Project Settings → Environment Variables → Add `GITHUB_PAT` and other variables.
  2. Redeploy your project.

Testing the server commit endpoint (after env vars set):

- From Admin: Set Owner & Repo in the Admin panel and save. Add/update a product and save — the server should commit and return success.

- Manual test (curl):

```bash
curl -X POST "https://YOUR_SITE/.netlify/functions/commit-products" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Password: aurascents2026" \
  -d '{"owner":"YOUR_GITHUB_USER","repo":"YOUR_REPO","products": [{"id":"test1","name":"Test","price":1,"category":"ladies","image":"","items":[]}]}'
```

Repository dispatch & workflow

- The server sends a `repository_dispatch` event with type `admin_products_updated` after a successful commit. The GitHub Actions workflow `dispatch-deploy.yml` listens for this event and deploys to `gh-pages` (or run on push to `main` as configured).

Security notes

- Revoke and rotate PATs immediately if exposed. Delete any tokens you mistakenly posted publicly.
- Use server mode when possible to avoid storing tokens in users' browsers.
- Limit token scope to the minimum required and prefer fine-grained tokens if possible.

## 📁 Files Included

```
aurascents/
├── index.html              # Main website (customers)
├── admin.html              # Admin panel (owner)
├── js/
│   ├── storefront.js       # Shopping cart functionality
│   └── admin.js            # Admin panel functionality
├── images/
│   ├── ladies-packages.jpeg # Ladies product image
│   └── men-packages.jpeg    # Men product image
├── ADMIN_GUIDE.md          # Complete admin documentation
├── netlify.toml            # Netlify configuration
├── _headers                # Security headers
├── robots.txt              # SEO configuration
├── package.json            # Project metadata
└── README.md               # This file
```

## 🎨 Customization

### Update Products

Edit `js/storefront.js` to change products:

```javascript
const products = {
    ladies: [
        {
            id: 'lady1',
            name: 'Blossom',
            price: 250,
            image: 'images/ladies-packages.jpeg',
            items: ['Mini perfume', 'Scented candle', ...]
        }
    ]
};
```

### Update Contact Information

Edit `index.html` to change contact details:

```javascript
const whatsappUrl = `https://wa.me/YOUR_NUMBER?text=...`;
```

### Change Colors

Update the `tailwind.config` in `index.html`:

```javascript
colors: {
    primary: '#8B2635',    // Burgundy
    secondary: '#D4AF37',  // Gold
}
```

## 🛍️ How It Works

1. **Customer browses products** with images
2. **Adds to cart** with quantity control
3. **Reviews cart** with total calculation
4. **Clicks checkout** to open WhatsApp
5. **Order message auto-filled** with product details

## ✨ Special Notes

- ✨ Each gift set can be personalized to reflect your unique style
- ✨ Additional items may be included upon request at a fee
- ✨ Kindly place orders in advance for premium packaging and delivery
- ✨ Also single perfumes are available for purchase

## 🔧 Technical Details

### Built With
- HTML5
- TailwindCSS (via CDN)
- Vanilla JavaScript (no frameworks)
- Font Awesome icons
- Google Fonts (Playfair Display & Montserrat)

### Browser Support
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

### Performance
- Fast loading with CDN resources
- Optimized images
- Smooth animations
- Minimal JavaScript

## 📊 Features Breakdown

### Shopping Cart
- Add/remove items
- Quantity adjustment
- Real-time total calculation
- Persistent during session
- Mobile-friendly interface

### Product Display
- High-quality product images
- Detailed item lists
- Clear pricing
- Themed badges
- Hover effects on desktop

### Contact Integration
- Multiple WhatsApp numbers
- Snapchat handle
- Physical location
- Auto-filled order messages

## 🐛 Troubleshooting

**Images not showing?**
- Make sure `images/` folder is uploaded
- Check image file names match exactly
- Ensure images are in JPEG format

**Cart not working?**
- Check browser console for errors
- Make sure JavaScript is enabled
- Try clearing browser cache

**WhatsApp not opening?**
- Verify WhatsApp is installed
- Check number format (233...)
- Try on mobile device

## 📄 License

All rights reserved © 2026 AuraScents

## 🙏 Credits

- Design & Development: Custom Perfume Store Theme
- Images: AuraScents Product Photography
- Icons: Font Awesome
- Fonts: Google Fonts

---

**Made with ❤️ in 2026 for perfume lovers**

For support: WhatsApp 0206845402 or call 0557743737
