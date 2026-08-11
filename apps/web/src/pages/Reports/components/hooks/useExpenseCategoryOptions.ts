import { expenseCategoriesApi } from "../../../../features/expense-category/expenseCategoryApi";

export function useExpenseCategoryOptions() {
  const { data: categoriesData } = expenseCategoriesApi.useGetExpenseCategoriesQuery({
    page: 1,
    limit: 1000,
  });
  const categories = categoriesData?.data || [];

  return [
    { value: "", label: "All Categories" },
    ...categories.map((category: any) => ({
      value: category.id.toString(),
      label: category.name,
    })),
  ];
}
