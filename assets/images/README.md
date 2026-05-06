# Images Needed

Replace each placeholder below with the real asset. All should be WebP for max performance.

| File                    | Description                                      | Source                          |
|-------------------------|--------------------------------------------------|---------------------------------|
| `logo.png`              | **Site logo** — copy exact file from live site   | warriorofgodtactical.com        |
| `hero-bg.webp`          | Full-screen hero background (tactical/outdoors)  | Live site or licensed stock     |
| `cat-handguns.webp`     | Handguns category card image                     | Live site or licensed stock     |
| `cat-rifles.webp`       | Rifles category card image                       | Live site or licensed stock     |
| `cat-ammo.webp`         | Ammunition category card image                   | Live site or licensed stock     |
| `cat-optics.webp`       | Optics category card image                       | Live site or licensed stock     |
| `cat-hunting.webp`      | Hunting & Camping category card image            | Live site or licensed stock     |
| `cat-apparel.webp`      | Clothing category card image                     | Live site or licensed stock     |
| `prod-mark-v.webp`      | Mark V Backcountry 2.0 product photo             | Manufacturer or live site       |
| `prod-g19.webp`         | G19 Gen3 Cerakoted product photo                 | Live site                       |
| `prod-thermion.webp`    | Pulsar Thermion Duo product photo                | Manufacturer or live site       |
| `prod-holster.webp`     | Liberator MK3 Holster product photo              | Live site                       |
| `prod-ammo-9mm.webp`    | Blazer Clean-Fire 9mm product photo              | Manufacturer or live site       |
| `prod-ammo-308.webp`    | Trophy Gold .308 product photo                   | Manufacturer or live site       |
| `deal-banner.webp`      | Deals section optics banner image                | Live site or licensed stock     |
| `about-team.webp`       | About / team photo                               | Live site                       |
| `og-image.webp`         | Open Graph social preview (1200×630)             | Design asset                    |

## Converting to WebP
```
cwebp input.jpg -o output.webp -q 82
# or via ImageMagick:
magick input.jpg -quality 82 output.webp
```

## Note on missing images
All `<img>` tags have `onerror` fallbacks — emoji icons will display if images are missing,
so the site works immediately even without real assets.
