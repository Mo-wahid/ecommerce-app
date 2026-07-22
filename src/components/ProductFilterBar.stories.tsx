import type { Meta, StoryObj } from "@storybook/react";
import ProductFilterBar from "./ProductFilterBar";

const meta: Meta<typeof ProductFilterBar> = {
  title: "Components/ProductFilterBar",
  component: ProductFilterBar,
  parameters: {
    layout: "padded",
  },
  args: {
    onSearchChange: (v) => console.log('search', v),
    onCategoryChange: (v) => console.log('category', v),
    onPriceRangeChange: (v) => console.log('price', v),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    searchQuery: "",
    selectedCategory: "All",
    categories: ["All", "Electronics", "Clothing", "Books"],
    showPriceFilter: false,
  },
};

export const WithPriceFilterAndSearch: Story = {
  args: {
    searchQuery: "laptop",
    selectedCategory: "Electronics",
    categories: ["All", "Electronics", "Clothing", "Books"],
    priceRange: "Over $100",
    showPriceFilter: true,
  },
};
