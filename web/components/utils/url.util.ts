/**
 * A regular expression pattern for validating URLs.
 *
 * This regex matches URLs with the following components:
 *
 * - **Scheme** (optional): Either `http` or `https`, followed by `://`. For example: `http://` or `https://`.
 * - **Domain**: Consists of domain labels, where each label is at least 2 characters long and can include alphanumeric characters and hyphens, but cannot start or end with a hyphen. Domain labels are separated by dots. For example: `example.`, `sub-domain.`, or `example-domain.`
 * - **Top-Level Domain (TLD)**: Must be at least 2 characters long and can include letters only. For example: `com`, `uk`, `info`.
 * - **Port Number** (optional): A colon `:` followed by one or more digits representing the port number. For example: `:8080`.
 * - **Path** (optional): Starts with a forward slash `/` followed by any characters except whitespace. For example: `/path/to/resource?query=param#fragment`.
 *
 */
export const URL_REGEX =
  /^(https?:\/\/)?([a-zA-Z0-9-]{2,}\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;

/**
 * Extracts the domain from a given URL.
 *
 * This function normalizes the input URL by adding a default protocol (`http://`) if none is provided.
 * It then parses the URL to extract the domain name, removing the `www.` prefix if present.
 * If the URL is invalid or empty, the function returns an empty string.
 *
 * @param url - A string representing the URL from which to extract the domain.
 *
 * @returns The domain extracted from the URL. If the URL is invalid or empty,
 *          an empty string is returned.
 *
 */
export const extractDomain = (url: string): string => {
  if (!url) return '';

  // Normalize the URL to ensure it includes a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url; // Add a default protocol
  }

  try {
    // Create a URL object to parse the domain
    const parsedUrl = new URL(url);

    // Get the hostname and remove 'www.' if it exists
    let domain = parsedUrl.hostname;

    // Remove 'www.' prefix if it's present
    if (domain.startsWith('www.')) {
      domain = domain.substring(4); // Strip the 'www.' part
    }

    return domain;
  } catch (error) {
    return '';
  }
};
