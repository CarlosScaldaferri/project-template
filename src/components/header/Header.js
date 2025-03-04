import Login from "../login/Login";
import Logo from "../logo/Logo";
import ThemeSelector from "../theme/ThemeSelector";

const Header = () => {
  return (
    <header className="bg-gradient-to-br from-secondary-default to-neutral-white flex border-b border-spacing-2 border-secondary-dark">
      <div className="p-3 pl-14">
        <Logo />
      </div>
      <div className="flex flex-grow"></div>
      <div className="flex space-x-5 mr-5 mt-2">
        <ThemeSelector />

        <Login />
      </div>
    </header>
  );
};

export default Header;
