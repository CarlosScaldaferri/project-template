import PropTypes from "prop-types";

export default function CustomImage({ src, alt, className = "", ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover rounded-md ${className}`}
      {...props}
    />
  );
}

CustomImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
};
