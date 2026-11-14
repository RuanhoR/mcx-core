import type { LayoutBox, LayoutResult } from './layout.js';

export interface SvgRenderOptions {
  result: LayoutResult;
  /** canvas background; `transparent` keeps the SVG transparent */
  background?: 'checker' | 'dark' | 'transparent';
  /** output pixel density, the viewBox stays in logical pixels */
  scale?: number;
  /** resolve a texture path to a data URI so screenshots stay self contained */
  textureUri?: (path: string) => string | undefined;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function drawText(
  box: LayoutBox,
  out: string[],
  key: string,
): void {
  const text = box.text;
  if (!text || !text.text) return;
  const anchor =
    text.align === 'left' ? 'start' : text.align === 'right' ? 'end' : 'middle';
  const x =
    text.align === 'left'
      ? box.x + 1
      : text.align === 'right'
        ? box.x + box.w - 1
        : box.x + box.w / 2;
  const lines = text.text.split('\n');
  const lineHeight = text.fontSize * 1.18;
  const startY = box.y + box.h / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    const common = `x="${round(x)}" y="${round(y)}" text-anchor="${anchor}" font-size="${round(
      text.fontSize,
    )}" font-family="'Minecraftia','Minecraft',ui-monospace,Consolas,monospace" dominant-baseline="middle"`;
    if (text.shadow) {
      out.push(
        `<text ${common} fill="#3f3f3f" transform="translate(1,1)" data-part="${key}-shadow">${escapeXml(
          line,
        )}</text>`,
      );
    }
    out.push(
      `<text ${common} fill="${escapeXml(
        text.color,
      )}" opacity="${text.dynamic ? 0.85 : 1}" data-part="${key}">${escapeXml(line)}</text>`,
    );
  });
}

function drawBox(
  box: LayoutBox,
  offsetX: number,
  offsetY: number,
  parentAlpha: number,
  options: SvgRenderOptions,
  out: string[],
): void {
  const alpha = Math.max(0, Math.min(1, box.alpha * parentAlpha));
  if (alpha <= 0.001) return;
  const x = round(offsetX + box.x);
  const y = round(offsetY + box.y);
  const w = round(box.w);
  const h = round(box.h);
  const key = `${box.kind}-${box.id}`;

  out.push(
    `<g opacity="${round(alpha)}" data-id="${escapeXml(box.id)}" data-kind="${box.kind}">`,
  );

  switch (box.kind) {
    case 'button':
    case 'toggle': {
      out.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#8b8b8b" stroke="#000000" stroke-width="1" />`,
        `<rect x="${round(x + 1)}" y="${round(y + 1)}" width="${round(
          Math.max(0, w - 2),
        )}" height="${round(Math.max(0, h * 0.45))}" fill="#a0a0a0" opacity="0.55" />`,
      );
      drawText(box, out, key);
      break;
    }
    case 'label':
      drawText(box, out, key);
      break;
    case 'image': {
      const uri = box.texture ? options.textureUri?.(box.texture.path) : undefined;
      if (uri && !box.texture?.dynamic) {
        out.push(
          `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${uri}" preserveAspectRatio="${
            box.tiled ? 'none' : 'none'
          }" />`,
        );
      } else {
        out.push(
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2f3440" stroke="#4b5563" stroke-width="1" stroke-dasharray="3 3" />`,
          `<text x="${round(x + w / 2)}" y="${round(
            y + h / 2,
          )}" text-anchor="middle" dominant-baseline="middle" font-size="${round(
            Math.min(9, Math.max(5, w / 12)),
          )}" fill="#7c8698" font-family="ui-monospace,Consolas,monospace">${escapeXml(
            box.texture?.path ?? 'image',
          )}</text>`,
        );
      }
      break;
    }
    case 'custom':
    case 'input':
    case 'scroll_view': {
      out.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1f2430" fill-opacity="0.35" stroke="#6b7280" stroke-width="1" stroke-dasharray="4 3" />`,
      );
      if (box.type && box.type !== 'custom') {
        out.push(
          `<text x="${round(x + 2)}" y="${round(
            y + 8,
          )}" font-size="7" fill="#94a3b8" font-family="ui-monospace,Consolas,monospace">${escapeXml(
            box.type,
          )}</text>`,
        );
      }
      drawText(box, out, key);
      break;
    }
    default: {
      if (box.text) drawText(box, out, key);
      break;
    }
  }

  const clip = box.clip
    ? `<clipPath id="clip-${escapeXml(box.id)}-${box.depth}"><rect x="${x}" y="${y}" width="${w}" height="${h}" /></clipPath>`
    : '';
  if (clip) out.push(`<defs>${clip}</defs>`);
  if (box.clip) out.push(`<g clip-path="url(#clip-${escapeXml(box.id)}-${box.depth})">`);

  const children = [...box.children].sort(
    (a, b) => a.layer - b.layer || a.depth - b.depth,
  );
  for (const child of children) {
    drawBox(child, x, y, alpha, options, out);
  }

  if (box.clip) out.push('</g>');
  out.push('</g>');
}

/** Render a laid out document into a standalone SVG document. */
export function renderSvg(options: SvgRenderOptions): string {
  const { result } = options;
  const scale = options.scale && options.scale > 0 ? options.scale : 1;
  const background = options.background ?? 'dark';
  const out: string[] = [];
  const w = result.width;
  const h = result.height;

  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${round(w * scale)}" height="${round(
      h * scale,
    )}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">`,
  );
  if (background === 'checker') {
    out.push(
      `<defs><pattern id="checker" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#2a2f3a"/><rect width="8" height="8" fill="#323845"/><rect x="8" y="8" width="8" height="8" fill="#323845"/></pattern></defs>`,
      `<rect width="${w}" height="${h}" fill="url(#checker)" />`,
    );
  } else if (background === 'dark') {
    out.push(
      `<rect width="${w}" height="${h}" fill="#141821" />`,
      `<rect width="${w}" height="${h}" fill="none" stroke="#2b3240" />`,
    );
  }

  drawBox(result.root, 0, 0, 1, options, out);
  out.push('</svg>');
  return out.join('');
}
