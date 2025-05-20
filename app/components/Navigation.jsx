import Link from "next/link";
import Container from "./Container";
import Image from "next/image";

const Navigation = () => {
  return (
    <div className="absolute w-full">
      <Container>
        <div>
          <Image />
        </div>
        <div className="flex justify-end text-2xl gap-10">
          <Link href="/">About</Link>
          <Link href="/projects">Projects</Link>
        </div>
      </Container>
    </div>
  );
};

export default Navigation;
