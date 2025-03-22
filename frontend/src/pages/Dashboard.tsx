import SideNavigation from "@/components/SideNavBar";

const Dashboard = () => {
  return (
    <div className="flex flex-col md:flex-row ml-4">
      <SideNavigation />
      <div className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p>Welcome to the dashboard</p>
      </div>
    </div>
  );
};

export default Dashboard;