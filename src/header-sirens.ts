import { artUrl } from './generated-art';
import './header-sirens.css';

// Decoration follows the existing case-alert-active state; no extra sound or
// input layer. Keeping the bulbs mounted lets the exit transition finish.
export const headerSirens = () => `<div class="header-sirens" aria-hidden="true">
  ${[0,1].map(i=>`<div class="header-siren" style="--siren-index:${i}">
    <img src="${artUrl('header-siren')}" alt="" width="384" height="384" decoding="async">
    <div class="header-siren-light"><span class="header-siren-beam"></span><span class="header-siren-glint"></span></div>
  </div>`).join('')}
</div>`;
