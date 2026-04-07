interface AuthParams {
    email: string;
    password: string;
}

interface Role {
  id: number;
  name_fr: string;
  name_eng: string;
}

interface UserType {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
}

interface UsersState {
  users: UserType[];
  loading: boolean;
  error: string | null;
}


export type {AuthParams, UserType, Role, UsersState}