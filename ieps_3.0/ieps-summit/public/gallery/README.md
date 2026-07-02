# Gallery photos

Drop edition photos into the matching folder here, then list them in
`lib/gallery.ts`.

```
public/gallery/
  ieps-2.0/   ← IEPS 2.0 photos (.jpg/.png/.webp)
  ieps-1.0/   ← IEPS 1.0 photos
```

Guidelines:
- Use web-friendly files (.jpg, .png, or .webp), ideally ≤ ~500 KB each.
- At least ~1200px on the long edge so they stay sharp in the lightbox.
- Name files descriptively, e.g. `opening-plenary.jpg`, `keynote.jpg`.

After adding files, add one entry per photo to the edition's `photos` array in
`lib/gallery.ts` (each needs a `src` path and an `alt` description that also
serves as the caption). Set `featured: true` on a standout shot to make its
tile span two columns.
