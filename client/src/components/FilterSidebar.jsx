import { productBrands, productCategories } from "@/data/products";

const FilterButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-full border px-3 py-2 text-sm transition ${
      active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const FilterSidebar = ({ filters, onFilterChange }) => (
  <div className="space-y-6 rounded-3xl border border-border bg-card p-5">
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Categories</p>
      <div className="flex flex-wrap gap-2">
        {productCategories.map((category) => (
          <FilterButton
            key={category}
            active={filters.category === category}
            onClick={() => onFilterChange("category", category)}
          >
            {category}
          </FilterButton>
        ))}
      </div>
    </div>

    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Brands</p>
      <div className="flex flex-wrap gap-2">
        {productBrands.map((brand) => (
          <FilterButton
            key={brand}
            active={filters.brand === brand}
            onClick={() => onFilterChange("brand", brand)}
          >
            {brand}
          </FilterButton>
        ))}
      </div>
    </div>
  </div>
);

export default FilterSidebar;

