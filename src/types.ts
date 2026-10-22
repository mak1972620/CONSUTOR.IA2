export type UserRole = 'admin' | 'abogado' | 'cliente';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  rfc?: string;
  type?: 'fisica' | 'moral';
  created_at?: string;
}

export interface Case {
  id: number;
  title: string;
  description?: string;
  client_id?: number;
  lawyer_id?: number;
  type?: string;
  court?: string;
  case_number?: string;
  status?: 'abierto' | 'en_tramite' | 'concluido' | 'archivado' | string;
  created_at?: string;
  client_name?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  lawyer_name?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  case_id?: number;
  assigned_to?: number;
  due_date?: string;
  status: 'pendiente' | 'en_progreso' | 'completada' | string;
  priority?: 'baja' | 'media' | 'alta' | 'urgente';
  case_title?: string;
  created_at?: string;
}

export interface Document {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  case_id?: number;
  uploaded_by?: number;
  category?: string;
  tags?: string;
  created_at?: string;
}

export interface Payment {
  id: number;
  case_id?: number;
  amount: number;
  currency: string;
  status: 'pendiente' | 'pagado' | 'cancelado' | string;
  payment_method?: string;
  description?: string;
  paid_at?: string;
  created_at?: string;
  case_title?: string;
}

export interface DocumentTemplate {
  id: number;
  title: string;
  description?: string;
  category: string;
  placeholders: string[]; // JSON array of string keys like ['client_name', 'case_id']
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  entity?: string;
  details?: string;
  ip_address?: string;
  created_at?: string;
  user_name?: string;
  user_email?: string;
}
