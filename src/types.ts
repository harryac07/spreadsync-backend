export type UserType = {
  email: string;
  password?: string;
  id: string;
  firstname: string;
  lastname: string;
  phone?: string;
  company?: string;
  is_active: true,
};

export interface Project {
  id: string;
  name: string;
  description: string;
  admin: string;
  account: string;
}

export interface Account {
  id: string;
  name: string;
  admin: string;
}

export interface Job {
  id: string;
  name: string;
  description: string;
  type: string;
  project: string;
  script: string;
  created_by: string;
}

export interface ProjectWithRelations {
  id: string,
  name: string;
  description: string;
  admin: string;
  account: string;
  created_on: string;
  updated_on: string;
  accountName: string;
  total_members?: any;
}

export type JwtDecodedType = {
  email?: string;
  user_id?: string;
};

