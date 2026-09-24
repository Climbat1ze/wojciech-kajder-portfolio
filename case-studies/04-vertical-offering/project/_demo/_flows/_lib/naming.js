'use strict';

/**
 * Naming conventions shared by stages 04 and 05: this is the single place
 * that decides the vertical slug and the build/publication filenames, so a
 * project never accumulates two incompatible naming schemes for the same
 * thing.
 */

function slugVertical(name) {
  return String(name)
    .replace(/&/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_]/g, '');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Default Build ID when the caller does not supply --build-id. */
function defaultBuildId(vertical, date) {
  return `${date || today()}_${slugVertical(vertical.name)}`;
}

/** Filename for a published deck: YYYY-MM-DD_Vertical_Offering_{Vertical}_FINAL_v{N}.ext */
function finalFilename(vertical, version, ext, date) {
  return `${date || today()}_Vertical_Offering_${slugVertical(vertical.name)}_FINAL_v${version}.${ext}`;
}

/** Match published files for a vertical, to find the next version number. */
function finalFilePattern(vertical) {
  return new RegExp(`_Vertical_Offering_${slugVertical(vertical.name)}_FINAL_v(\\d+)\\.(md|html)$`, 'i');
}

module.exports = { slugVertical, today, defaultBuildId, finalFilename, finalFilePattern };
