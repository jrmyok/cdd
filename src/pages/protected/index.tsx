import Table from "@/components/table";
import Layout from "@/components/protected-layout";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-start space-y-5">
        <div className={"h-full w-full"}>
          <h1 className="text-4xl text-white">Luminate a coin</h1>
        </div>
        <Table />
      </div>
    </Layout>
  );
}
