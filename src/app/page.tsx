import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  return (
    <div className="bg-slate-50 min-h-screen ">
      <Map />
    </div>
  );
}
