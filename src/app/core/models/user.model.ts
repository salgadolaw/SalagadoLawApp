export interface User {
   pk_iduser: string;
  v_firstname: string;
  v_lastname: string;
  username: string;
  email: string;
  pk_states: number;
  v_namestate: string;
  roles: string[]; // ids o slugs de rol
  d_dateregistro?: string;
  d_dateupdate?: string;
  //password?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
}
