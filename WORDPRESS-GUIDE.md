# Migration Pulse Hub — WordPress Implementation Guide

Design System v2.0 | May 2026 | Prepared by Zuri IT Consults

---

## 1. Theme Recommendation

Use any minimal, block-compatible WordPress theme. Recommended options (all free):

| Theme | Why |
|---|---|
| **Hello Elementor** | Lightest. Best if using Elementor page builder. |
| **Astra** | Fast, highly customisable, good Global Colours support. |
| **GeneratePress** | Clean output, good for hand-coded blocks. |
| **Kadence** | Built-in Header/Footer builder, easy layout control. |

> Avoid heavily opinionated themes (Divi, Avada built-in styles) — their CSS specificity can conflict with `mph-` classes.

---

## 2. Loading Fonts

**Option A — Additional CSS (simplest)**  
The `@import` line at the top of `wordpress-additional.css` loads fonts automatically. No PHP required.

**Option B — `functions.php` (better performance)**  
Add to your child theme's `functions.php`:

```php
function mph_enqueue_fonts() {
    wp_enqueue_style(
        'mph-google-fonts',
        'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap',
        [],
        null
    );
}
add_action( 'wp_enqueue_scripts', 'mph_enqueue_fonts' );
```

Then remove the `@import` line from `wordpress-additional.css` to avoid loading fonts twice.

---

## 3. Pasting the Design System CSS

1. Go to **WordPress Admin → Appearance → Customize → Additional CSS**
2. Open `assets/css/wordpress-additional.css` in a text editor
3. Select all → Copy → Paste into the Additional CSS field
4. Click **Publish**

The full `mph-` class system is now active across the site.

---

## 4. Page-by-Page SEO Titles & Meta Descriptions

Set these in **Yoast SEO** or **Rank Math** on each page.

### Home (`index.html`)
- **SEO Title:** Migration Pulse Hub — Defending Migrant Rights in Africa
- **Meta Description:** Migration Pulse Hub safeguards the dignity and human rights of migrants, refugees, and displaced persons through advocacy, research, legal action, and community empowerment across Africa.
- **Focus Keyphrase:** migrant rights Africa

### About Us (`about.html`)
- **SEO Title:** About Us | Migration Pulse Hub
- **Meta Description:** Learn how Migration Pulse Hub was founded, our mission to protect migrant rights, and the values that drive our advocacy and legal work across the region.
- **Focus Keyphrase:** migrant rights organisation Kenya

### Our Work (`our-work.html`)
- **SEO Title:** Our Work — Advocacy, Research & Legal Action | Migration Pulse Hub
- **Meta Description:** Explore Migration Pulse Hub's four pillars: policy advocacy, evidence-based research, strategic litigation, and capacity building for migrant communities.
- **Focus Keyphrase:** migrant advocacy legal support Kenya

### Impact (`impact.html`)
- **SEO Title:** Our Impact | Migration Pulse Hub
- **Meta Description:** Over 12,000 people reached, 847 legal cases supported, and policy changes across 6 countries. See how Migration Pulse Hub is making a measurable difference.
- **Focus Keyphrase:** migration impact outcomes Africa

### Partners (`partners.html`)
- **SEO Title:** Partners & Collaborators | Migration Pulse Hub
- **Meta Description:** Migration Pulse Hub works with UN agencies, governments, NGOs, law firms, and academic institutions to advance migrant rights across East Africa and beyond.
- **Focus Keyphrase:** migration NGO partners East Africa

### Knowledge Hub (`knowledge-hub.html`)
- **SEO Title:** Knowledge Hub — Resources & Research | Migration Pulse Hub
- **Meta Description:** Access free reports, toolkits, legal instruments, and training resources on migration, displacement, and refugee rights in Africa.
- **Focus Keyphrase:** migration resources Africa free download

### Reports & Publications (`reports.html`)
- **SEO Title:** Reports & Publications | Migration Pulse Hub
- **Meta Description:** Download Migration Pulse Hub's annual reports, policy briefs, and research publications on migrant rights, displacement, and legal protections in Africa.
- **Focus Keyphrase:** migration reports publications Kenya

### News & Updates (`news.html`)
- **SEO Title:** News & Updates | Migration Pulse Hub
- **Meta Description:** Stay informed with the latest news, policy developments, and stories from Migration Pulse Hub on migrant rights, advocacy, and refugee protection.
- **Focus Keyphrase:** migration news Kenya Africa

### Events (`events.html`)
- **SEO Title:** Events | Migration Pulse Hub
- **Meta Description:** Join Migration Pulse Hub's upcoming conferences, webinars, and training sessions on migration policy, refugee rights, and legal advocacy.
- **Focus Keyphrase:** migration events Kenya webinar

### Team (`team.html`)
- **SEO Title:** Our Team | Migration Pulse Hub
- **Meta Description:** Meet the lawyers, researchers, and advocates leading Migration Pulse Hub's work to protect migrant rights and displaced persons across Africa.
- **Focus Keyphrase:** migration rights team Kenya

### Support Us (`support.html`)
- **SEO Title:** Support Migration Pulse Hub — Donate or Volunteer
- **Meta Description:** Help protect migrant rights. Make a donation, volunteer your skills, or partner with Migration Pulse Hub to advance dignity and justice for displaced persons.
- **Focus Keyphrase:** support migrant rights donation Kenya

### Media Centre (`media.html`)
- **SEO Title:** Media Centre | Migration Pulse Hub
- **Meta Description:** Press releases, media contacts, spokespeople, and brand assets for journalists and communications teams covering Migration Pulse Hub's work.
- **Focus Keyphrase:** Migration Pulse Hub press media contact

### Contact Us (`contact.html`)
- **SEO Title:** Contact Us | Migration Pulse Hub
- **Meta Description:** Get in touch with Migration Pulse Hub for legal support enquiries, media requests, partnership opportunities, or general information about our work.
- **Focus Keyphrase:** contact Migration Pulse Hub Kenya

### Privacy & Legal (`privacy.html`)
- **SEO Title:** Privacy Policy & Safeguarding | Migration Pulse Hub
- **Meta Description:** Migration Pulse Hub's privacy policy, data protection statement, terms of use, safeguarding policy, and cookie policy.
- **Focus Keyphrase:** Migration Pulse Hub privacy policy

---

## 5. Content Upload Workflow (Reports & Publications)

For each report added to the Knowledge Hub or Reports page:

1. **Upload the PDF** via Media Library → Note the file URL
2. **Create a new WordPress Page** using the report landing page template
3. **Add the report metadata** using Custom Fields or ACF:
   - `report_title`
   - `report_year`
   - `report_pages`
   - `report_language`
   - `report_pdf_url`
4. **Replace the download button `href`** with the Media Library PDF URL
5. **Set featured image** using a cover mockup (Canva template provided in brand kit)
6. **Set Yoast SEO title/description** for the individual report page
7. **Add to the Reports archive page** by embedding the `mph-report-card` shortcode or block

---

## 6. JavaScript — Enqueueing `main.js`

Copy `assets/js/main.js` to your child theme's `/js/` folder, then add to `functions.php`:

```php
function mph_enqueue_scripts() {
    wp_enqueue_script(
        'mph-main',
        get_stylesheet_directory_uri() . '/js/main.js',
        [],
        '2.0',
        true // load in footer
    );
}
add_action( 'wp_enqueue_scripts', 'mph_enqueue_scripts' );
```

`main.js` handles: hamburger nav, scroll reveal (IntersectionObserver), animated counters, accordions, back-to-top button.

---

## 7. WordPress Implementation Timeline

### Week 1 — Foundation
- [ ] Install WordPress on hosting (recommended: Cloudways, SiteGround, or WP Engine)
- [ ] Install and activate chosen theme (Hello Elementor or Astra)
- [ ] Install plugins: Yoast SEO, WP Rocket (caching), UpdraftPlus (backups), Akismet
- [ ] Paste `wordpress-additional.css` into Additional CSS
- [ ] Enqueue Google Fonts via `functions.php`
- [ ] Enqueue `main.js` via `functions.php`
- [ ] Create all 14 pages (blank, titles set)

### Week 2 — Content Migration
- [ ] Copy content from each HTML page into the corresponding WordPress page
- [ ] Add `mph-` CSS classes to page builder blocks or raw HTML blocks
- [ ] Upload all report PDFs to Media Library
- [ ] Set SEO titles and meta descriptions on all 14 pages (from Section 4 above)
- [ ] Set featured images on all key pages

### Week 3 — Testing & Launch Prep
- [ ] Test on mobile (iPhone, Android Chrome)
- [ ] Test on tablet (iPad 768px breakpoint)
- [ ] Run Google PageSpeed Insights — target 85+ on mobile
- [ ] Check all forms submit correctly (Contact Form 7 or WPForms)
- [ ] Test all download links for PDFs
- [ ] Check 404 redirects from old static HTML URLs if migrating
- [ ] Submit sitemap to Google Search Console

### Week 4 — Launch & Post-Launch
- [ ] Point domain DNS to WordPress hosting
- [ ] Install SSL certificate (Let's Encrypt via hosting panel)
- [ ] Force HTTPS in WordPress Settings → General
- [ ] Submit sitemap: `yourdomain.org/sitemap.xml`
- [ ] Set up Google Analytics 4 (via Site Kit plugin)
- [ ] Schedule first post-launch backup

---

## 8. Monthly Maintenance Checklist

Run this on the first Monday of each month:

- [ ] Update WordPress core, themes, plugins
- [ ] Run manual backup (UpdraftPlus → Backup Now)
- [ ] Check Google Search Console for crawl errors or manual actions
- [ ] Review Google Analytics for traffic trends
- [ ] Add any new reports or publications to the Knowledge Hub
- [ ] Post at least one news update or event
- [ ] Check contact form is delivering emails (send a test submission)
- [ ] Review broken links (use Broken Link Checker plugin)

---

## 9. Contact Form Setup (Contact Form 7)

Install **Contact Form 7**. Use this shortcode on the Contact page:

```
[contact-form-7 id="contact" title="Main Contact Form"]
```

Recommended form fields (matching the HTML contact form):

```
[text* your-name placeholder "Full Name"]
[email* your-email placeholder "Email Address"]
[text your-org placeholder "Organisation / Affiliation (optional)"]
[tel your-phone placeholder "Phone Number (optional)"]
[select* your-subject "General Enquiry" "Legal Support Request" "Media & Press" "Partnership Opportunity" "Volunteer Application" "Research Collaboration" "Event Information" "Safeguarding Concern" "Other"]
[textarea* your-message placeholder "Your Message"]
[acceptance your-consent] I agree to the Privacy Policy and consent to my data being used to respond to this enquiry. [/acceptance]
[submit "Send Message"]
```

Set the **mail recipient** to `info@migrationpulsehub.org` in CF7 settings.

---

## 10. Colour Reference (for Page Builder Use)

| Token | HEX | Use |
|---|---|---|
| Navy | `#0B1F3A` | Primary background, headings |
| Teal | `#14B8A6` | Buttons, highlights, links |
| Teal Dark | `#0F766E` | Hover states, eyebrow text |
| Coral | `#E85D4F` | Alerts, accent highlights |
| Gold | `#F4A261` | Secondary accent, warm highlights |
| Sand | `#F7F3EA` | Section backgrounds, cards |
| Background | `#F7F9FC` | Page background |
| Text | `#243044` | Body text |
| Muted | `#667085` | Subtext, labels |

---

*Guide prepared by Zuri IT Consults for Migration Pulse Hub. For technical support, contact ryanmwaks@gmail.com.*
