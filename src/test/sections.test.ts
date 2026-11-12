import { describe, expect, it } from "vitest";
import { categories, collections, occasions, picks, products, services } from "@/lib/store-data";

describe("Home page sections", () => {
  it("shows every category with a product image behind it", () => {
    for (const c of categories) expect(products.some((p) => p.category === c), c).toBe(true);
  });

  it("resolves every occasion to at least one product", () => {
    for (const [name, words] of occasions) {
      expect(products.filter((p) => words.some((w) => p.name.includes(w))), name).not.toHaveLength(0);
    }
  });

  it("resolves every collection group to at least one product", () => {
    for (const [name, , cats] of collections) {
      expect(products.filter((p) => cats.includes(p.category)), name).not.toHaveLength(0);
    }
  });

  it("lists hand picks that exist as products and unique services", () => {
    for (const n of picks) expect(products.some((p) => p.name === n), n).toBe(true);
    expect(new Set(services).size).toBe(services.length);
  });
});
