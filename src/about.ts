// Everything shown on the "About" page. Edit freely.
// Photo lives in public/; `photo` is its file name there (a transparent cut-out PNG looks best).
// Stickers live in public/stickers/ (free CC0 photos, see public/stickers/CREDITS.md).

import type { DoodleName } from './ui/Doodles';

export interface AboutNote {
  text: string;
  /** Hand-drawn pen mark shown with the note. */
  doodle?: DoodleName;
  /** Cut-out photo sticker (file in public/stickers/) placed beside the note. */
  sticker?: string;
  /** Larger text, like a headline on the page. */
  big?: boolean;
  /** Pen circle around the note. */
  circled?: boolean;
  /** Pen underline below the note. */
  underlined?: boolean;
}

export const about = {
  name: 'Preethika',
  role: 'Creator & admin of WishFund',
  photo: 'me-cutout.png',
  // The first six sit left of the photo, the rest on the right.
  notes: [
    { text: 'Student at PSG iTech', doodle: 'asterisk', big: true, underlined: true },
    { text: 'Turns ideas into apps', doodle: 'arrow' },
    { text: 'Loves pixel games (a lot)' },
    { text: 'Way too dramatic sometimes' },
    { text: 'Camera roll is her bestfriend', sticker: 'camera.webp', doodle: 'hearts' },
    { text: 'Dreaming of travelling the world', doodle: 'plane' },
    { text: 'Saving up for things she loves', sticker: 'cake.webp', circled: true },
    { text: 'Blue is her favourite colour', underlined: true },
    { text: 'Sunflower energy', sticker: 'sunflower.webp' },
    { text: 'Extrovert who talks to everyone', doodle: 'arrow-back' },
    { text: 'Coffee + code = happy place', sticker: 'coffee.webp' },
    { text: 'Wishlist is always growing' },
  ] satisfies AboutNote[] as AboutNote[],
  /** Extra stickers tucked around the edges, like the reference scrapbook. */
  corners: ['macarons.webp', 'croissant.webp'],
  memo: 'She built WishFund so every rupee has a job and every wish gets a countdown.',
  signoff: 'made w love, Preethika <3',
};
