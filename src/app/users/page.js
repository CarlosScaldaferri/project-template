import UserForm from "@/components/user/form/UserForm";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default withPageAuthRequired(function UserRegistration() {
  return (
    <>
      <UserForm />
    </>
  );
});
