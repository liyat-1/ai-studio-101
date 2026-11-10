import { describe, expect, it } from "vitest";
import { contentChecks, smsSegments } from "@/lib/campaign-checks";
import { DRAFT_SEED } from "@/lib/studio-data";

const step = DRAFT_SEED.steps[0]!;
const status = (label: string, s = step, ch: Parameters<typeof contentChecks>[1] = "sms") =>
  contentChecks(s, ch, 0).find((c) => c.label === label)?.status;

describe("campaign content checks", () => {
  it("flags SMS without STOP wording", () => {
    expect(status("STOP wording included")).toBe("Passed");
    expect(status("STOP wording included", { ...step, sms: { ...step.sms, text: "The Meridian: book direct mrdn.co/stay" } })).toBe("Needs attention");
  });
  it("splits SMS over 160 characters", () => {
    expect(smsSegments("a".repeat(160))).toBe(1);
    expect(smsSegments("a".repeat(161))).toBe(2);
  });
  it("requires an email subject", () => {
    expect(status("Subject line present", { ...step, email: { ...step.email, subject: "" } }, "email")).toBe("Needs attention");
  });
});
