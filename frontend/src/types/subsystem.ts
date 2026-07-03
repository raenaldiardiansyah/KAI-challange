import type { SubsystemName } from "./common";

export type SubsystemDefinition = {
  name: SubsystemName;
  signals: string[];
};
