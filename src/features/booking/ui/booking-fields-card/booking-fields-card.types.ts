import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";

export type BookingField = ServiceDetailScreenProps["service"]["fields"][number];
export type BookingFieldHandler = (field: BookingField) => void;
