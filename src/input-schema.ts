export interface InputEnumOptionItem {
  value: string | number
  title?: string
  description?: string
}

export type InputEnumType = Array<string | number | InputEnumOptionItem>;

export interface InputSchema {
  name?: string;
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  enum?: InputEnumType;
  minPick?: number;
  maxPick?: number;
  uniqueItems?: boolean;
  separator?: string;
  items?: InputSchema;
  properties?: Record<string, InputSchema>;
  title?: string;
  description?: string;
  default?: any;
};
