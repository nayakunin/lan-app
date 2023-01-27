import { useFormik } from 'formik';

import { useAuth } from '@/hooks';
import { trpc } from '@/utils/trpc';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const authRequest = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      auth.setJwt(data.token);
      navigate('/chat');
    },
  });

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    onSubmit: (values) => {
      authRequest.mutateAsync(values);
    },
  });

  return (
    <div className="p-4 min-h-screen flex flex-col">
      <h1 className="text-3xl text-white">Auth</h1>
      <div className="pt-2 min-h-full grid items-center flex-grow">
        <form onSubmit={formik.handleSubmit} className="flex flex-col items-center gap-2">
          <input
            className="p-2 bg-zinc-700 rounded text-white"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <button className="p-2 bg-zinc-700 rounded text-white w-1/2" type="submit">
            auth
          </button>
        </form>
      </div>
    </div>
  );
};
