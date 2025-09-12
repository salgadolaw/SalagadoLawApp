export interface Role {
   id: string;    // p.ej. 'admin', 'agent'
  label: string; // 'Administrador', 'Agente'
  // permisos opcionales
  permissions?: string[];
}
