import Table from "@/components/table";
import Layout from "@/components/protected-layout";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-start space-y-5">
        <div className={"h-full w-full"}>
          <h1 className="text-3xl font-semibold text-white">
            All Your Crypto Data in One Place
          </h1>
        </div>
        <Table />
      </div>
    </Layout>
  );
}
