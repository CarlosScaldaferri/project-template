import Login from "../login/Login";
import Logo from "../logo/Logo";
import ThemeSelector from "../theme/ThemeSelector";

const Header = () => {
  return (
    <header className="bg-primary flex">
      <div className="p-3 pl-14">
        <Logo />
      </div>
      <div className="flex flex-grow"></div>
      <div className="m-5">
        <ThemeSelector />
      </div>
      <div className="m-5">
        <Login />
      </div>
    </header>
  );
};

export default Header;
