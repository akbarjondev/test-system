import { LoginForm } from "../ui/LoginForm";

export default function LoginPage() {
  return <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-2xl font-bold mb-4">Kirish</h1>
    <div className="min-w-96">
      <LoginForm />
    </div>
  </div>;
}