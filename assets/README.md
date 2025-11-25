# Assets Directory

## Structure

```
assets/
├── images/          # Static images (logos, photos, service images)
│   ├── tabs-1.jpg   # Startup Package service image
│   ├── tabs-2.jpg   # Sales Strategies service image
│   ├── tabs-3.jpg   # Customer Success service image
│   ├── tabs-4.jpg   # Lead Generation service image
│   ├── testimonial-1.jpg
│   ├── testimonial-2.jpg
│   ├── testimonial-3.jpg
│   ├── testimonial-4.jpg
│   └── testimonial-5.jpg
│
└── videos/          # Video files for Phase 2 animations
    ├── hero.mp4
    ├── portrait-1.mp4
    └── (more videos as needed)
```

## Asset Guidelines

### Images
- **Format:** JPG for photos, PNG for logos/graphics with transparency
- **Optimization:** Compress images for web (target < 200KB per image)
- **Dimensions:** Minimum 1200px wide for hero/service images

### Videos (Phase 2)
- **Format:** MP4 (H.264 codec for broad compatibility)
- **Duration:** 3-7 seconds (short loops)
- **Dimensions:** Match corresponding static image dimensions
- **File Size:** Target < 1MB per video for smooth loading
- **Optimization:** Use tools like HandBrake or FFmpeg to compress

## Current Status

**Phase 1 (Clean Site):**
- Images needed: Add actual photos/graphics to replace placeholders
- Videos: Not yet needed

**Phase 2 (Animations):**
- Videos will be generated via Stable Diffusion
- Each video should seamlessly transition from/to its static image counterpart
