import type {
  ClientHomeGroupView,
  ClientHomeView,
} from "@/features/gallery/application/use-cases/get-client-home/get-client-home.types";
import type { ClientGateView } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

export interface ClientHomeScreenProps {
  readonly gate: ClientGateView;
  readonly home: ClientHomeView;
  readonly token: string;
}

export interface GroupCardProps {
  readonly group: ClientHomeGroupView;
  readonly token: string;
  readonly isLast: boolean;
}
