# Wei-Chun Chen — personal website

A static personal website. There is no build step or package installation.

## Local preview

Run the following from this folder, then open <http://127.0.0.1:4312>:

```sh
python3 -m http.server 4312 --bind 127.0.0.1
```

Use `Ctrl+C` to stop the preview server. Opening `index.html` directly also works; a local server makes resource loading easier to check.

## Files and maintenance

| File | Purpose |
| --- | --- |
| `index.html` | Biography, milestones, resource links, and contact information |
| `style.css` | Responsive layout, keyboard focus, reduced-motion preference, and print layout |
| `script.js` | Progressive enhancement for navigation, theme preference, and copying the email |
| `favicon.svg` | Monochrome WC browser icon |
| `portrait.webp` | Optimized portrait served to browsers that support WebP |
| `64744.jpg` | Original portrait and fallback for other browsers |

Keep the section IDs `HOME`, `INTRODUCE`, `PUBLICATIONS`, and `CONTACT` when updating navigation. Each link must match an existing ID. Update both the visible date and the ISO `datetime` value when editing a milestone.

To replace the portrait, update both image files and the `width`/`height` values on the `<img>`. Keep the original proportions. The browser selects the JPG when WebP is unsupported; both files must be included when publishing.

Preserve the existing publication titles, author order, and arXiv links when changing the layout. The current list contains six entries. The commented Equiangular lines handout is credited to Gary Greaves and remains archived in the source. Keep `rel="noopener noreferrer"` on links with `target="_blank"`.

## Navigation behavior

At widths up to 760px, the menu button opens and closes the navigation. Selecting a destination closes it; `Escape` closes it and returns focus to the button. A click or keyboard focus outside the header also closes it. Keyboard focus follows the selected section and remains usable when the viewport crosses the breakpoint. Navigation can scroll within a short viewport; anchor offsets follow the actual header height, including wrapped controls and enlarged text.

With JavaScript disabled, the navigation remains visible. The page content, section links, email link, and portrait remain usable. The site loads no third-party scripts or fonts.

The header scrolls with the page when JavaScript is disabled or the viewport is at most 480px tall, so enlarged navigation never covers the entire reading area. Text and header controls can wrap when the reader enlarges the font.

The current section is underlined and has `aria-current="location"`. Scrolling updates it through IntersectionObserver and a throttled scroll listener. Selecting a section link keeps that destination indicated until subsequent scrolling, including when a short section cannot align with the top of the viewport. The indicator does not add entries to browser history.

Back and Forward restore focus to their section without overriding browser scroll restoration. Rapid Tab navigation into another section also updates a pending manual selection; loading the page without a fragment leaves initial focus on the document.

## Theme and email controls

The Color theme selector supports System, Light, and Dark. System follows `prefers-color-scheme`, including changes while the page is open. Explicit choices use the `chenwei-theme` localStorage key and synchronize between tabs. Invalid stored values fall back to System; blocked storage keeps the selected theme for the current page. Without JavaScript, CSS still follows the system theme. Print output uses a light background.

A small head script applies a validated explicit preference before CSS paints, so delayed loading of `script.js` does not flash the opposite theme. If renaming `chenwei-theme`, update the head script and the full theme controller together. Cross-tab updates accept only localStorage events; sessionStorage changes do not reset the preference.

Copy email requests the Clipboard API from a button click. On success, an accessible status message confirms it. If the browser blocks, lacks, or does not complete the API request within 30 seconds, a readonly email field appears for manual copying with Ctrl+C, ⌘C, or the mobile selection menu. It receives focus and selects the address while the reader remains at Contact; a delayed result never takes focus back from another section. The button becomes available again, and late results after a timeout are ignored. The original `mailto:` link remains available.

Each milestone is a separate list item with one date and description. If the WebP portrait fails to load while JavaScript is enabled, the page retries the preserved original JPG; it does not repeatedly retry a missing original.

Print uses a compact two-column introduction, preserves each publication entry and the Contact block across page breaks, and hides screen-only controls and new-tab hints. The source text, author order, and destination URLs remain unchanged.

The Open Graph title and description repeat the existing site information. No deployment URL is assumed; add canonical or absolute share-image URLs only when the actual published address is known.

## Check after changing the site

- Check desktop and narrow mobile widths, including 320px; content should not overlap or scroll horizontally.
- Open the mobile menu, follow all four section links, press `Escape`, and resize across 760px.
- Use `Tab` to reach the Skip to content link, navigation, resource link, email, and social profiles.
- Check the browser console and network panel for script errors or missing local files.
- Verify the publication links and social profiles in a browser; access to these destinations is managed by the external services.
- Check print preview and JavaScript-disabled navigation after layout changes.
- Check the current-section underline after scrolling, following anchors, and using browser Back/Forward.
- Check all three theme options, system-theme changes, reload persistence, and unavailable storage.
- Check Copy email with clipboard permission allowed and denied; the manual copy field must remain usable on failure.
