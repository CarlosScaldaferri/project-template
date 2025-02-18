import Login from "./login/Login";

const Header = () => {
  return (
    <header className="bg-green-200 h-24 flex">
      <div className="flex flex-grow"></div>
      <div className="flex flex-col items-center justify-center p-5">
        <Login />
      </div>
    </header>
  );
};

export default Header;
