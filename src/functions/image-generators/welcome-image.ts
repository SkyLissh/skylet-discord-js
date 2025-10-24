import { createCanvas } from "canvas";
import fs from "node:fs";

const WIDTH = 700;
const HEIGHT = 250;
const TITLE = "Draw and save images with Canvas and Node";

/**
 * Wrap text into lines based on a maximum number of characters per line.
 * Preserves whole words where possible, but will split long words if they
 * exceed the maxChars limit.
 */
function wrapTextByChars(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(/(\s+)/); // keep delimiters so we can preserve spaces
  const lines: string[] = [];
  let current = "";

  for (const token of words) {
    // token may be a word or whitespace
    const tentative = current + token;

    if (tentative.length <= maxChars) {
      current = tentative;
      continue;
    }

    // If token itself (without current) is longer than maxChars, we need to split it
    if (token.trim().length > maxChars) {
      // flush current line first
      if (current.trim().length) {
        lines.push(current.trimEnd());
        current = "";
      }

      // split the long token into chunks
      let remaining = token;
      while (remaining.length > maxChars) {
        lines.push(remaining.slice(0, maxChars));
        remaining = remaining.slice(maxChars);
      }

      // leftover (could be whitespace or partial word)
      current = remaining;
      continue;
    }

    // token fits on its own line but not when appended -> flush current and start new
    if (current.length) {
      lines.push(current.trimEnd());
    }
    current = token.trimStart();
  }

  if (current.trim().length) lines.push(current.trim());
  return lines;
}

export async function generateWelcomeImage(
  username: string,
  avatarUrl: string,
  maxChars: number = 20
): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#23272A";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  ctx.font = "bold 40px Sans-serif";
  ctx.fillStyle = "#FFFFFF";

  // Wrap the provided username into lines based on maxChars
  const lines = wrapTextByChars(TITLE, maxChars);

  // Render lines centered vertically around HEIGHT/2
  const lineHeight = 44; // a bit larger than font size to avoid overlap
  const totalHeight = lines.length * lineHeight;
  let startY = HEIGHT / 2 - totalHeight / 2 + lineHeight / 2;

  for (const line of lines) {
    ctx.fillText(line, WIDTH / 2, startY);
    startY += lineHeight;
  }

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("./welcome-image.png", buffer);

  return buffer;
}

generateWelcomeImage("Alice", "https://example.com/avatar.png");
