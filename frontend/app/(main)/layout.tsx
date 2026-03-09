import Sidebar from "@/components/layout/Sidebar";

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="ml-60 flex-1">{children}</main>
  </div>
);

export default MainLayout;
