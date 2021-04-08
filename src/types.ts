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
  data_source: string;
  data_target: string;
  created_by: string;
  created_on: any;
  updated_on: any;
}

export interface CreateJobPayload {
  name: string;
  description: string;
  type: string;
  project: string;
  script?: string;
  data_source: string;
  data_target: string;
  created_by: string;
}

export interface JobSchedule {
  id: string;
  job: string;
  frequency_name: string;
  value: string | number;
  unit: string;
  created_on: string;
  updated_on: string;
}

export interface DataSource {
  id: string;
  job: string;
  database_type: 'postgres' | 'mysql';
  is_ssl: boolean;
  alias_name: string;
  database_host: string;
  database_name: string;
  database_port: string;
  database_user: string;
  database_password: string;
  is_ssh: boolean;
  ssh_host: string;
  ssh_username: string;
  ssh_password: string;
  ssh_port: string;
  ssh_key: string;
  data_type: 'source' | 'target';
  created_on: string;
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

export interface SocialAuth {
  id?: string;
  user_id: string,
  job_id: string;
  type: 'target' | 'source';
  social_name: 'google';
  token_type: string;
  expiry_date: number;
  scope: string;
  refresh_token: string;
  access_token: string;
  id_token: string;
  created_on?: string;
}

export type CreateSocialAuthPayload = Omit<SocialAuth, 'id' | 'created_on'>;

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

