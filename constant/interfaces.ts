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

// interface CommonHeaderType {
//   "Content-Type" : string
// }

interface DocType {
  id?: number;
  name: string,
  description: string,
  submissionDate: string,
  status: string,
  baseUrl: string,
  apiMethod: string,
  commonHeader: string,
  bearerToken: string ,
  created_by: UserType
}

interface UsersState {
  users: UserType[];
  loading: boolean;
  error: string | null;
}

interface DocsState {
  docs: DocType[];
}

interface DecodedToken {
  role?: {
    id: number;
    name?: string;
  };
  exp?: number;
  iat?: number;
}

export type {DocType,DocsState, AuthParams, UserType, Role, UsersState, DecodedToken}