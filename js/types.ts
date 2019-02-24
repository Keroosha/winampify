export interface File {
  id: string;
  title: string;
  type: string;
  uri: string;
  x: number;
  y: number;
  renaming: boolean;
}

export interface Image {
  id: string;
  source: string;
  x: number;
  y: number;
}
