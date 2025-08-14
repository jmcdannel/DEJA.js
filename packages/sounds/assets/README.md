# Sound Effects Directory

This directory contains sound effects for the DEJA.js system. Sound effects are organized by category and can be used in effects throughout the application.

## Directory Structure

```
sounds/
├── train/          # Train-related sounds (whistles, horns, wheel squeal, etc.)
├── station/        # Station sounds (announcements, ticket machines, etc.)
├── city/           # City ambient sounds (traffic, pedestrians, etc.)
└── nature/         # Nature sounds (birds, wind, etc.)
```

## Adding Sound Files

1. **File Format**: Use MP3 format for best compatibility
2. **Quality**: Aim for 44.1kHz, 16-bit or better
3. **Duration**: Keep sounds under 30 seconds for best performance
4. **Naming**: Use descriptive names with hyphens (e.g., `steam-whistle.mp3`)

## Recommended Sound Sources

### Royalty-Free Libraries
- **BBC Sound Effects Library**: https://sound-effects.bbcrewind.co.uk
  - High-quality, professionally recorded sounds
  - BBC RemArc Licence (free for non-commercial use)
  - Excellent for train, station, and ambient sounds

- **FreeSound.org**: https://freesound.org
  - Creative Commons licensed sounds
  - Large community-contributed library
  - Good for nature and mechanical sounds

- **Zapsplat**: https://www.zapsplat.com
  - Professional sound effects library
  - Requires account (free tier available)
  - High-quality train and industrial sounds

### Specific Sound Recommendations

#### Train Sounds
- Steam locomotive whistle (3-5 seconds)
- Diesel horn (2-3 seconds)
- Wheel squeal on curves (1-2 seconds)
- Steam engine chuff (0.5-1 second, loopable)
- Brake release (1-2 seconds)
- Coupler clank (0.5-1 second)

#### Station Sounds
- Station announcement (5-10 seconds)
- Ticket machine beep (0.5-1 second)
- Platform bell (1-2 seconds)
- Footsteps on platform (2-3 seconds)
- Train arrival/departure chime (1-2 seconds)

#### City Sounds
- Traffic ambience (10-15 seconds, loopable)
- Pedestrian crossing signal (1-2 seconds)
- Car horns (0.5-1 second)
- Bus engine (2-3 seconds)
- Construction sounds (3-5 seconds)

#### Nature Sounds
- Birds chirping (8-12 seconds, loopable)
- Wind through trees (10-15 seconds, loopable)
- Water flowing (8-12 seconds, loopable)
- Insects buzzing (5-8 seconds, loopable)
- Distant thunder (3-5 seconds)

## Integration

After adding sound files:

1. Update the `CURATED_SOUNDS` array in `packages/modules/effects/soundService.ts`
2. Add the sound to the appropriate category
3. Include relevant tags for searchability
4. Test the sound in the effects system

## Example Sound Entry

```typescript
{
  id: 'steam-whistle-long',
  name: 'Steam Locomotive Long Whistle',
  category: 'train',
  url: '/sounds/train/steam-whistle-long.mp3',
  duration: 5000,
  tags: ['steam', 'whistle', 'locomotive', 'long', 'dramatic'],
  source: 'local',
  license: 'Royalty Free'
}
```

## Tips for Good Sound Effects

1. **Loopable Sounds**: For ambient sounds, create seamless loops
2. **Volume Consistency**: Normalize all sounds to similar levels
3. **Fade In/Out**: Add small fades to prevent clicks
4. **Multiple Variations**: Include different versions of similar sounds
5. **Quality vs Size**: Balance audio quality with file size for web delivery

## Legal Considerations

- Ensure all sounds are properly licensed
- Include attribution when required
- Respect usage restrictions
- Keep records of sound sources and licenses
