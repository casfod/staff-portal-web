import { useMutation } from '@tanstack/react-query';
import { forgotPassword as forgotPasswordApi } from '../../../services/apiAuth.ts';
// import { AxiosError } from "axios";
import { toast } from 'react-hot-toast';
import { IPasswordForgot } from '../../../interfaces.ts';

export function useForgotPassword() {
  const {
    mutate: forgotPassword,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ email }: IPasswordForgot) => forgotPasswordApi(email),

    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Successful! please check your mail.');
      } else {
        toast.error(`${data.message}`);
        console.error('Forgot Password Error:', data.message);
      }
    },

    onError: err => {
      toast.error('Network or server error');
      console.log('ERROR', err);
    },
  });

  return { forgotPassword, isPending, isError };
}
