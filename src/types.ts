export interface UserType {
  email: string;
  password?: string;
  id: string;
  firstname: string;
  lastname: string;
  phone?: string;
  company?: string;
  is_active?: true,
  created_on?: any;
  updated_on?: any;
};

export interface Project {
  id: string;
  name: string;
  description: string;
  admin: string;
  account: string;
  created_on?: any;
  updated_on?: any;
}

export interface Account {
  id: string;
  name: string;
  admin: string;
  created_on?: any;
  updated_on?: any;
}

export interface Job {
  id: string;
  name: string;
  description: string;
  type: string;
  project: string;
  script: string;
  created_by: string;
  created_on: any;
  updated_on: any;
}

export interface UserInvolvement {
  id: string;
  user: string;
  project: string;
  account: string;
  project_role: string;
  project_permission: string;
}

export interface UserAuth {
  id?: string,
  user_id: string,
  last_logged_in: string,
  token: string,
  is_token_valid: boolean,
}

export type UserInvolvementPayload = {
  user?: string;
  project?: string;
  account?: string;
  project_role?: string;
  project_permission?: string;
}

export type AccountPayload = {
  name?: string;
  admin?: string;
  created_on?: any;
  updated_on?: any;
}

export type JobListWithProject = Array<Job & { user_email: string, user_id: string }>

export type ProjectWithRelations = Project & {
  accountName: string;
  total_members?: string | number;
}

export type CreateUserPayload = Pick<UserType, 'email' | 'password'> & {
  phone?: string | number;
  company?: string;
  firstname?: string;
  lastname?: string;
  is_active?: boolean;
}

export type UpdateUserPayload = {
  email?: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  is_active?: true,
}

export type JwtDecodedType = {
  email?: string;
  user_id?: string;
};

