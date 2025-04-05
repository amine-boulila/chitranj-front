// app/(auth)/resetpassword/page.tsx
import dynamic from "next/dynamic";

// Lazy-load the component without SSR
const ResetPassword = dynamic(() => import("./resetpasswordclient"), {
  ssr: false,
});

export default function Page() {
  return <ResetPassword />;
}
