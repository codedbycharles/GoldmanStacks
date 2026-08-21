import { expect, test, describe } from "vitest";
import { getAgeMultiplier } from "./cover-calculation.service.js";

test("foo", () => {
  expect(getAgeMultiplier(1).toNumber()).toEqual(0.8);
});

describe("getAgeMultiplier", () => {
  const testCases = [
    { in: 1, expected: 0.8 },
    { in: 31, expected: 1 },
  ];

  testCases.forEach((tc) => {
    test(`Test in = ${tc.in}`, () => {
      expect(getAgeMultiplier(tc.in).toNumber()).toEqual(tc.expected);
    });
  });
});
