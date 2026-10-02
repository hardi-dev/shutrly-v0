import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { ItemDefinitionGroups } from "@/features/booking/application/use-cases/list-item-definitions/list-item-definitions.types";
import type {
  ServiceDetailView,
  ServiceListGroup,
} from "@/features/booking/application/use-cases/service-results/service-results.types";

export type CategoriesData = readonly CategoryRecord[];
export type ItemDefinitionsData = ItemDefinitionGroups;
export type ServicesData = readonly ServiceListGroup[];
export type ServiceDetailData = ServiceDetailView;
