import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LinkedInCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Handle error case
      window.opener?.postMessage(
        { type: 'linkedin-auth-error', error },
        window.location.origin
      );
      window.close();
      return;
    }

    if (code) {
      // Send the code back to the opener window
      window.opener?.postMessage(
        { type: 'linkedin-auth-success', code },
        window.location.origin
      );
      window.close();
    } else {
      // No code or error, redirect to dashboard
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Processing LinkedIn Authorization...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You will be redirected automatically.
        </p>
      </div>
    </div>
  );
};

export default LinkedInCallback; 