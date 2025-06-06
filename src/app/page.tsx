import TopBar from './components/TopBar'
import CustomersTable from './components/CustomersTable'

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <TopBar />
      <main className="flex-1 p-4">
        <CustomersTable />
      </main>
    </div>
  );
}