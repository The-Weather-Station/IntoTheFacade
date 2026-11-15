# Card movement sound effects

Source: [Casino Audio 1.1 by Kenney Vleugels (Kenney.nl)](https://kenney.nl/assets/casino-audio).
License: [Creative Commons Zero (CC0 1.0)](https://creativecommons.org/publicdomain/zero/1.0/).
The original pack license is included as `kenney-casino-license.txt`.
Downloaded from the publisher on November 14, 2026.

| Site file | Original file in the pack | Adaptation |
| --- | --- | --- |
| `card-deal.mp3` | `Audio/card-fan-1.ogg` | 180 ms silence prepended to match the start of the deal animation. |
| `card-return.mp3` | `Audio/card-shove-1.ogg` | Converted to MP3 for the outgoing stack movement. |
| `card-shuffle.mp3` | `Audio/card-shuffle.ogg` | 0.94-second excerpt beginning at 0.55 seconds, with 10 ms fade-in and 80 ms fade-out to match one card cycle. |

All three files were converted with FFmpeg to mono, 44.1 kHz, 96 kbps MP3.
The website loads them only when cards move; no audio is awaited by rendering.
These credits apply to the three card effects, not the separate soundtrack or alarm.
