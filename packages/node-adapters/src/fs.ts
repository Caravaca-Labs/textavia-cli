/**
 * @fileoverview Filesystem adapter: reads, atomic writes, and backups.
 *
 * Writes go through a temp-file-plus-rename so a failed write never leaves the
 * destination truncated. Backups are created before an overwrite when
 * requested. All failures surface as {@link FileIoError} so callers get a
 * consistent exit code.
 */

import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import type { FileAdapter, TextEncoding } from '@textavia/core';
import { FileIoError } from '@textavia/core';

/** Options controlling how a file is written. */
export interface WriteOptions {
  /** Create a `.bak` copy of the existing file before overwriting. */
  readonly backup?: boolean;
  /** Report the intended write without touching the filesystem. */
  readonly dryRun?: boolean;
}

function toBuffer(data: string | Uint8Array): Buffer {
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
}

/** Reads a file as text using the given encoding. */
export async function readTextFile(
  path: string,
  encoding: TextEncoding = 'utf8',
): Promise<string> {
  try {
    return await fs.readFile(path, encoding);
  } catch (error) {
    throw new FileIoError(`Failed to read file: ${path}`, {
      hint: 'Check that the path exists and is readable.',
      cause: error,
    });
  }
}

/** Reads a file as raw bytes. */
export async function readBytesFile(path: string): Promise<Uint8Array> {
  try {
    return await fs.readFile(path);
  } catch (error) {
    throw new FileIoError(`Failed to read file: ${path}`, {
      hint: 'Check that the path exists and is readable.',
      cause: error,
    });
  }
}

/**
 * Writes `data` to `path` atomically via a temp file and rename.
 *
 * When `options.backup` is set and the destination exists, a `.bak` copy is
 * created first. `options.dryRun` skips the write entirely and returns the
 * intended path. Failed writes delete the temp file and leave the destination
 * intact whenever the platform supports atomic rename.
 */
export async function writeAtomic(
  path: string,
  data: string | Uint8Array,
  options: WriteOptions = {},
): Promise<string> {
  if (options.dryRun) {
    return path;
  }
  const dir = dirname(path);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    throw new FileIoError(`Failed to create directory: ${dir}`, {
      cause: error,
    });
  }

  if (options.backup) {
    await backupFile(path);
  }

  const tempPath = join(
    dir,
    `.${basename(path)}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`,
  );
  try {
    const handle = await fs.open(tempPath, 'w');
    try {
      await handle.writeFile(toBuffer(data));
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fs.rename(tempPath, path);
  } catch (error) {
    await safeUnlink(tempPath);
    throw new FileIoError(`Failed to write file: ${path}`, { cause: error });
  }
  return path;
}

/** Creates a `.bak` copy of `path`. No-op when the source does not exist. */
export async function backupFile(path: string): Promise<string> {
  if (!(await pathExists(path))) {
    return path;
  }
  const backupPath = `${path}.bak`;
  try {
    await fs.copyFile(path, backupPath);
  } catch (error) {
    throw new FileIoError(`Failed to create backup: ${backupPath}`, {
      cause: error,
    });
  }
  return backupPath;
}

/** True when `path` exists on the filesystem. */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await fs.unlink(path);
  } catch {
    // Best-effort cleanup of a temp file; ignore failures.
  }
}

function basename(path: string): string {
  const idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return idx >= 0 ? path.slice(idx + 1) : path;
}

/** Core FileAdapter implementation backed by Node fs. */
export const nodeFileAdapter: FileAdapter = {
  readText: (path, encoding) => readTextFile(path, encoding),
  readBytes: (path) => readBytesFile(path),
  writeAtomic: (path, data) => writeAtomic(path, data),
  backup: (path) => backupFile(path),
  exists: (path) => pathExists(path),
};
