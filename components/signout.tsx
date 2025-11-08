"use server"
import { signOut } from "@/lib/auth.ts"
 
export default async function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button type="submit">Sign Out</button>
    </form>
  )
}
