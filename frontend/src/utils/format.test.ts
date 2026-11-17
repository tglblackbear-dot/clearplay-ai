import { describe, expect, it } from "vitest";
import { formatClock } from "./format";

describe("formatClock", () => {
  it("formata segundos", () => {
    expect(formatClock(75)).toBe("1:15");
  });
  it("retorna travessão para valor inválido", () => {
    expect(formatClock(Number.NaN)).toBe("—");
  });
});
