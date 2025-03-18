import SideNavigation from "@/components/SideNavBar";

const Dashboard = () => {
  return (
    <div className="flex flex-col md:flex-row">
      <SideNavigation />
      <div className="flex-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p>Welcome to the dashboard</p>
      </div>
    </div>
  );
};

export default Dashboard;