import Image from "next/image";

export const Logo = () => {
  return (
    <div className={"flex items-center justify-center py-2"}>
      <Image
        src={"/logo-header.png"}
        className=""
        alt={"logo"}
        width={50}
        height={50}
      />
    </div>
  );
};

export default Logo;
