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

export type JobListWithProject = Array<Job & { user_email: string, user_id: string }>

export type ProjectWithRelations = Project & {
  accountName: string;
  total_members?: string | number;
}

export type JwtDecodedType = {
  email?: string;
  user_id?: string;
};

