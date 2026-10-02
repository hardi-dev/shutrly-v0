import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";

export type ServiceItem = ServiceDetailScreenProps["service"]["items"][number];
export type ServiceItemHandler = (item: ServiceItem) => void;
