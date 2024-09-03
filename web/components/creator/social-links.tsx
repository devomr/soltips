import { SocialIcon } from '../shared/icons/social-icon';

export type SocialLinksProps = {
  links: string[];
};

export const SocialLinks = ({ links }: SocialLinksProps) => {
  return (
    <div className="flex gap-2">
      {links.map((link) => (
        <SocialLink key={link} value={link} />
      ))}
    </div>
  );
};

type SocialLinkProps = {
  value: string;
};

const SocialLink = ({ value }: SocialLinkProps) => {
  return (
    <a href={value} target="_blank" rel="noopener noreferrer">
      <SocialIcon url={value} size={28} />
    </a>
  );
};
