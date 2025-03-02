import PropTypes from "prop-types";

export default function Image({ src, alt, className, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      {...props}
    />
  );
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
};
