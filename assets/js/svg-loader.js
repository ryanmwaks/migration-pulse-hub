/* Migration Pulse Hub — SVG Sprite Loader v1.0
 * Fetches assets/svg/sprite.svg and injects it into the DOM so all
 * <use href="#ico-*"> references resolve from a single shared file.
 * This replaces the ~80-line inline SVG block previously duplicated
 * across every HTML page.
 */
(function () {
  // Resolve the sprite path relative to the document's origin, not
  // relative to this script's location (works on any page depth)
  var origin = window.location.origin || '';
  var path   = '/assets/svg/sprite.svg';

  fetch(origin + path, { credentials: 'same-origin' })
    .then(function (r) { return r.text(); })
    .then(function (svg) {
      var div = document.createElement('div');
      div.setAttribute('aria-hidden', 'true');
      div.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      div.innerHTML = svg;
      document.body.insertBefore(div, document.body.firstChild);
    })
    .catch(function () {
      // Silently fail — the browser will just render nothing for SVG icons
      // rather than breaking the page layout.
    });
})();
