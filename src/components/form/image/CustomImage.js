import PropTypes from "prop-types";

export default function CustomImage({ src, alt, className = "", ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover border border-light-border dark:border-dark-border bg-light-background-sidebar dark:bg-dark-background-sidebar ${className}`}
      {...props}
    />
  );
}

CustomImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
};
