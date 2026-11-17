import { describe, expect, it } from "vitest";
import { applyOffset, estimateSync, findActiveSegment, type CutManifest } from "./manifest-engine";

const manifest: CutManifest = {
  schema_version: "1.0.0",
  episode_id: "ep1",
  duration_ms: 60000,
  manifest_version: 1,
  status: "verified",
  segments: [
    { id: "s1", category: "violence", start_ms: 10000, end_ms: 12000, confidence: 0.9, verification_status: "verified" },
    { id: "s2", category: "sex", start_ms: 20000, end_ms: 22000, confidence: 0.7, verification_status: "verified" },
  ],
};

describe("findActiveSegment", () => {
  it("retorna segmento ativo quando categoria permitida", () => {
    const found = findActiveSegment(manifest, 11000, new Set(["violence"]), "full");
    expect(found?.id).toBe("s1");
  });

  it("respeita modo parcial por confiança", () => {
    expect(findActiveSegment(manifest, 21000, new Set(["sex"]), "partial")).toBeNull();
    expect(findActiveSegment(manifest, 21000, new Set(["sex"]), "full")?.id).toBe("s2");
  });

  it("desativa Quando modo off", () => {
    expect(findActiveSegment(manifest, 11000, new Set(["violence"]), "off")).toBeNull();
  });
});

describe("applyOffset", () => {
  it("desloca intervalos sem valores negativos", () => {
    const shifted = applyOffset(manifest, -15000);
    expect(shifted.segments[0].start_ms).toBe(0);
  });
});

describe("estimateSync", () => {
  it("confiança alta para durações iguais", () => {
    expect(estimateSync(60000, 60000).confidence).toBe(1);
  });
  it("confiança menor para durações diferentes", () => {
    expect(estimateSync(60000, 63000).confidence).toBeLessThan(1);
  });
});
