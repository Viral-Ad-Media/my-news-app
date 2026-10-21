import Signup from "../../components/Signup";

export const metadata = {
  title: "Create account | AbokiNews",
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <div>
      <Signup />
    </div>
  );
}
