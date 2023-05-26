import Table from "@/components/table";
import Layout from "@/components/protected-layout";

export default function Home() {
  return (
    <Layout>
      <div className="mt-10 flex flex-col items-start ">
        <Table />
      </div>
    </Layout>
  );
}
