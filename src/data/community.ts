// 社區送養 — verified individual listings.
//
// Everything here is hand-moderated: volunteers submit via #/community/submit,
// the team verifies the info and photos, then an entry is added below and it
// ships with the next build. Nothing auto-publishes — that keeps scammers out.
import type { Listing } from '../types';

// Moderation template (one entry per approved listing):
// {
//   id: 'c-<volunteer>-<n>',
//   name: '小黑', type: 'dog', orgId: 'community',
//   url: 'https://wa.me/8529xxxxxxx',            // rescuer's contact link
//   img: 'https://...',                           // verified photo (rehosted by team)
//   gender: 'male', breed: '唐狗', ageMonths: 24, size: 'medium',
//   note: { zh: '<rescuer description>', en: '<same>' },
//   by: '<volunteer name>', emoji: '🐶', hue: 200,
// }
export const COMMUNITY_ANIMALS: Listing[] = [];
