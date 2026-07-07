import { redirect } from "next/navigation";

// The dashboard is home. A landing page can live here later.
export default function Home() {
  redirect("/dashboard");
}
