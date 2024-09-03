import { extractDomain } from '@/components/utils/url.util';
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandReddit,
  IconBrandTiktok,
  IconBrandTwitch,
  IconBrandX,
  IconBrandYoutube,
  IconLink,
} from '@tabler/icons-react';
import { ReactElement } from 'react';

interface SocialIconProps {
  url: string;
  size?: number;
}

const domainIconMap: { [key: string]: (size: number) => ReactElement } = {
  'youtube.com': (size: number) => <IconBrandYoutube size={size} />,
  'facebook.com': (size: number) => <IconBrandFacebook size={size} />,
  'instagram.com': (size: number) => <IconBrandInstagram size={size} />,
  'tiktok.com': (size: number) => <IconBrandTiktok size={size} />,
  'x.com': (size: number) => <IconBrandX size={size} />,
  'twitter.com': (size: number) => <IconBrandX size={size} />,
  'discord.com': (size: number) => <IconBrandDiscord size={size} />,
  'reddit.com': (size: number) => <IconBrandReddit size={size} />,
  'twitch.tv': (size: number) => <IconBrandTwitch size={size} />,
  'github.com': (size: number) => <IconBrandGithub size={size} />,
};

export const SocialIcon: React.FC<SocialIconProps> = ({ url, size = 20 }) => {
  const domain = extractDomain(url);

  const renderIcon = domainIconMap[domain];

  if (!renderIcon) {
    return <IconLink size={size} />;
  }

  return renderIcon(size);
};
