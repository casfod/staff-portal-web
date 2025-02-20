export interface UserType {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  isDeleted?: boolean;
  password?: string;
  passwordConfirm?: string;
}
