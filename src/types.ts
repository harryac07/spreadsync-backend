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

export type JwtDecodedType = {
  email?: string;
  user_id?: string;
};
