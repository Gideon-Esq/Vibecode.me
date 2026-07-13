/**
 * Gallery photo manifest — the single source of truth for the Gallery page.
 *
 * HOW TO ADD PHOTOS FROM AN OLDER EDITION
 * ---------------------------------------
 * 1. Drop the image files into `public/gallery/<edition-slug>/`, e.g.
 *      public/gallery/ieps-2.0/opening-plenary.jpg
 *      public/gallery/ieps-2.0/keynote.jpg
 *    Use web-friendly files (.jpg / .png / .webp), ideally ≤ ~500 KB and at
 *    least ~1200px on the long edge so they stay crisp in the lightbox.
 * 2. Add one entry per photo to the matching edition's `photos` array below.
 *    `src` is the path under /public (starts with "/gallery/…").
 *    `alt` doubles as the caption, so write a short, descriptive sentence.
 *    Set `featured: true` on a standout shot to let it span two columns.
 *
 * Editions with an empty `photos` array render a tasteful placeholder, so it's
 * safe to leave a future edition listed before its photos are ready.
 */

export type GalleryPhoto = {
  /** Path under /public, e.g. "/gallery/ieps-2.0/opening.jpg". */
  src: string;
  /** Description — used for accessibility AND as the on-image caption. */
  alt: string;
  /** When true, the tile spans two columns for visual rhythm. */
  featured?: boolean;
};

export type GalleryEdition = {
  /** Display name, e.g. "IEPS 2.0". */
  edition: string;
  /** Year the edition took place, shown beside the title. */
  year?: string;
  photos: GalleryPhoto[];
};

/**
 * Previous-edition galleries, newest first.
 * Fill in the `photos` arrays as the images become available (see header).
 */
export const PREVIOUS_EDITIONS: GalleryEdition[] = [
  {
    edition: "IEPS",
    photos: [
      { src: "/gallery/ieps-1.0/1719758046035.jpg", alt: "The panel of guests at the high table", featured: true },
      { src: "/gallery/ieps-1.0/1719758046587.jpg", alt: "Delegates and organisers gather for a group photo", featured: true },
      { src: "/gallery/ieps-1.0/1719758046979.jpg", alt: "Presenting the ESRC Innovative Leadership Award" },
      { src: "/gallery/ieps-1.0/1719758045037.jpg", alt: "Award recipients with their ESRC plaques" },
      { src: "/gallery/ieps-1.0/1719758045093.jpg", alt: "A full house of delegates at the summit" },
      { src: "/gallery/ieps-1.0/1719758046915.jpg", alt: "Delegates share a moment for the camera" },
    ],
  },
];
