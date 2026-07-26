import { describe, it, expect } from 'vitest';
import {
  PNGImageComponent,
  JPGImageComponent,
  SVGImageComponent,
  GIFImageComponent,
} from '../src/lib';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync, writeFileSync } from 'node:fs';

describe('ImageComponent', () => {
  it('should create PNGImageComponent with valid file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'img-test-'));
    const filePath = join(dir, 'test.png');
    writeFileSync(filePath, 'fake-png');
    const img = new PNGImageComponent(filePath);
    expect(img.filePath).toBe(filePath);
    expect(img.classId).toBe('mcx_png_2340192');
  });

  it('should create JPGImageComponent', () => {
    const dir = mkdtempSync(join(tmpdir(), 'img-test-'));
    const filePath = join(dir, 'test.jpg');
    writeFileSync(filePath, 'fake-jpg');
    const img = new JPGImageComponent(filePath);
    expect(img.classId).toContain('mcx_jpg');
  });

  it('should create SVGImageComponent', () => {
    const dir = mkdtempSync(join(tmpdir(), 'img-test-'));
    const filePath = join(dir, 'test.svg');
    writeFileSync(filePath, 'fake-svg');
    const img = new SVGImageComponent(filePath);
    expect(img.classId).toContain('mcx_svg');
  });

  it('should create GIFImageComponent', () => {
    const dir = mkdtempSync(join(tmpdir(), 'img-test-'));
    const filePath = join(dir, 'test.gif');
    writeFileSync(filePath, 'fake-gif');
    const img = new GIFImageComponent(filePath);
    expect(img.classId).toContain('mcx_git');
  });

  it('should throw for non-existent file', () => {
    expect(() => new PNGImageComponent('/nonexistent.png')).toThrow("can't resolve image");
  });

  it('should throw for wrong file extension', () => {
    const dir = mkdtempSync(join(tmpdir(), 'img-test-'));
    const filePath = join(dir, 'test.txt');
    writeFileSync(filePath, 'fake');
    expect(() => new PNGImageComponent(filePath)).toThrow('file extname');
  });
});
