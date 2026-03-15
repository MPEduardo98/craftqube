// app/admin/productos/components/sections/multimedia/ModalImagenEdit/types.ts

export type PanelTab = "informacion" | "recortar" | "tamaño";
export type Handle = "move" | "tl" | "t" | "tr" | "r" | "br" | "b" | "bl" | "l";

export interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  size?: number;
  created?: string;
}

export interface ModalImagenEditProps {
  imagen: any;
  productoId?: number;
  slug?: string;
  existingNames: string[];
  onChangeAlt: (alt: string) => void;
  onRemove: () => void;
  onClose: () => void;
}