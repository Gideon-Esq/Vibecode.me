a# Landing page assets

Filenames are referenced directly by `src/app/page.tsx` and
`src/components/landing/destination-rail.tsx`, so they must match exactly.

All photos below are self-hosted (downloaded, not hotlinked) from Unsplash under
the [Unsplash License](https://unsplash.com/license), sized for their slot. To
swap one, drop a replacement at the same filename — no code change needed.

| File                 | Used by                          | Source                                       |
| -------------------- | -------------------------------- | -------------------------------------------- |
| `hero-scene.jpg`     | Hero backdrop behind the mock    | Ulun Danu Beratan temple, Bali (chosen photo) |
| `bali-preview.jpg`   | Dashboard "place preview" tile   | Bali resort pool                              |
| `itinerary-1.jpg`    | Day 4 thumbnail stack            | Bali rice terrace                             |
| `itinerary-2.jpg`    | Day 4 thumbnail stack            | Bali rice terrace                             |
| `itinerary-3.jpg`    | Day 4 thumbnail stack            | Bali rice terrace                             |
| `dest-bali.jpg`      | Destinations rail                | Kelingking cliff / beach                      |
| `dest-tokyo.jpg`     | Destinations rail                | Tokyo Tower skyline                           |
| `dest-paris.jpg`     | Destinations rail                | Eiffel Tower over the Seine                   |
| `dest-dubai.jpg`     | Destinations rail                | Dubai skyline                                 |
| `dest-cape-town.jpg` | Destinations rail                | Coast + Table Mountain                        |
| `dest-santorini.jpg` | Destinations rail                | Blue-domed churches, Oia                      |
| `dest-zanzibar.jpg`  | Destinations rail                | Palm beach                                    |
| `dest-new-york.jpg`  | Destinations rail                | Manhattan skyline                             |
| `cta-bg.jpg`         | Final CTA background             | Aerial beach                                  |

## Still missing

| File                 | Used by                            | Status                          |
| -------------------- | ---------------------------------- | ------------------------------- |
| `traveler-panel.jpg` | "Less planning. More exploring."   | Awaiting `traveler.png` artwork |

The slot renders as an empty gradient panel until the file exists — the section
still lays out correctly, it just has no photo.

Destination cards and the CTA sit under dark gradients, so favour images with a
bright subject; detail in the lower third gets covered either way.
