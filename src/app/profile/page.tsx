import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] pt-16 bg-background transition-colors">
      <main className="flex-1 p-6 sm:p-8 lg:p-12 w-full">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your personal profile and preferences.</p>
            </div>
          </div>
          <ProfileForm />
        </div>
      </main>
    </div>
  );
}
