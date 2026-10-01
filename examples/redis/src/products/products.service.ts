export interface Product {
  id: string;
  name: string;
  price: number;
}

export const productsService = {
  loads: 0,
  products: new Map<string, Product>([
    ["1", { id: "1", name: "Keyboard", price: 49 }],
    ["2", { id: "2", name: "Mouse", price: 25 }],
  ]),

  async get(id: string): Promise<Product | undefined> {
    this.loads++;
    await Bun.sleep(50);
    return this.products.get(id);
  },

  update(id: string, input: { name?: string; price?: number }): Product | undefined {
    const product = this.products.get(id);
    if (!product) return undefined;
    const next = { ...product, ...input };
    this.products.set(id, next);
    return next;
  },
};
