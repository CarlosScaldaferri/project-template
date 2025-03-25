import PropTypes from "prop-types";
import clsx from "clsx";

const BASE_STYLES =
  "border border-light-border dark:border-dark-border bg-light-background-sidebar dark:bg-dark-background-sidebar";

export default function CustomImage({
  src,
  alt,
  className = "",
  objectFit = "cover",
  ...props
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={clsx(BASE_STYLES, `object-${objectFit}`, className)}
      {...props}
    />
  );
}

CustomImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  objectFit: PropTypes.oneOf([
    "cover",
    "contain",
    "fill",
    "none",
    "scale-down",
  ]),
};
