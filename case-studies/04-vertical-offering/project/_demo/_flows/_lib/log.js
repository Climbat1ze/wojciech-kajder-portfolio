'use strict';

/**
 * Console logging for stages.
 *
 * Deliberately ASCII-only, so it never garbles in a console with a different
 * codepage. Tags are plain text; anything that must look nice belongs in a
 * generated artifact, not in an operational log line.
 */

const DEBUG = process.argv.includes('--debug');

function stamp() {
  return new Date().toISOString().slice(11, 19);
}

function emit(stream, tag, message) {
  stream.write(`[${stamp()}] ${tag.padEnd(5)} ${message}\n`);
}

const log = {
  info: (message) => emit(process.stdout, 'INFO', message),
  ok: (message) => emit(process.stdout, 'OK', message),
  warn: (message) => emit(process.stdout, 'WARN', message),
  error: (message) => emit(process.stderr, 'ERROR', message),
  debug: (message) => { if (DEBUG) emit(process.stdout, 'DEBUG', message); },

  section(title) {
    process.stdout.write('\n' + '='.repeat(72) + '\n');
    process.stdout.write('  ' + title + '\n');
    process.stdout.write('='.repeat(72) + '\n');
  },

  /** Render a small table of counts, used by stages to summarise what they did. */
  counts(pairs) {
    const width = Math.max(...Object.keys(pairs).map((k) => k.length), 0);
    for (const [key, value] of Object.entries(pairs)) {
      process.stdout.write(`         ${key.padEnd(width)}  ${value}\n`);
    }
  }
};

module.exports = { log, DEBUG };
