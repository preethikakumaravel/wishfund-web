// Everything shown on the "About" page. Edit freely.
// Photo lives in public/; `photo` is its file name there (a transparent cut-out PNG looks best).

import type { DoodleName } from './ui/Doodles';

export interface AboutNote {
  text: string;
  /** Hand-drawn mark shown with the note. */
  doodle?: DoodleName;
  /** Larger, bolder text (like a headline on the page). */
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
    { text: 'Loves pixel games (a lot)', doodle: 'gamepad' },
    { text: 'Way too dramatic sometimes', doodle: 'sparkle' },
    { text: 'Camera roll is her bestfriend', doodle: 'camera' },
    { text: 'Dreaming of travelling the world', doodle: 'plane' },
    { text: 'Saving up for things she loves', circled: true },
    { text: 'Blue is her favourite colour', doodle: 'blue-heart' },
    { text: 'Sunflower energy', doodle: 'sunflower' },
    { text: 'Extrovert who talks to everyone', doodle: 'speech' },
    { text: 'Coffee + code = happy place', doodle: 'coffee' },
    { text: 'Wishlist is always growing', doodle: 'arrow-back' },
  ] satisfies AboutNote[] as AboutNote[],
  memo: 'She built WishFund so every rupee has a job and every wish gets a countdown.',
  signoff: 'made w love, Preethika <3',
};
