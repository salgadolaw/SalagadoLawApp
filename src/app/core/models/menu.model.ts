
export interface MenuItemApi {
  id: string | number;
  label: string;
  icon?: string | null;
  path?: string | null;
  children?: MenuItemApi[] | null;
}


export interface MenuItem {
  id: string;              // normalizamos a string
  label: string;
  icon?: string;           // sin null
  path?: string;           // sin null
  children?: MenuItem[];   // sin null
}
